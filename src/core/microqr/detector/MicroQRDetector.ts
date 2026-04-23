/*
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import BitMatrix from '../../common/BitMatrix';
import MathUtils from '../../common/detector/MathUtils';
import DetectorResult from '../../common/DetectorResult';
import GridSamplerInstance from '../../common/GridSamplerInstance';
import PerspectiveTransform from '../../common/PerspectiveTransform';
import DecodeHintType from '../../DecodeHintType';
import NotFoundException from '../../NotFoundException';
import ResultPoint from '../../ResultPoint';
import ResultPointCallback from '../../ResultPointCallback';
import MicroQRFinderPattern from './MicroQRFinderPattern';

/**
 * Detects a Micro QR Code in an image.
 *
 * Algorithm:
 *   1. Scan rows for 1:1:3:1:1 ratio black/white/black/white/black run (same as QR finder).
 *   2. Cross-check candidate vertically.
 *   3. Estimate module size from the cross-section of the finder.
 *   4. Probe timing patterns (row 0 and col 0) from the finder center to determine symbol dimension.
 *   5. Build perspective transform from 3 anchor points:
 *      - topLeft: finder center
 *      - topRight: projected along horizontal timing direction
 *      - bottomLeft: projected along vertical timing direction
 *   6. Sample the grid.
 */
export default class MicroQRDetector {

    private resultPointCallback: ResultPointCallback | null;

    public constructor(private readonly image: BitMatrix) {}

    public detect(hints?: Map<DecodeHintType, any>): DetectorResult {
        this.resultPointCallback = (hints != null)
            ? hints.get(DecodeHintType.NEED_RESULT_POINT_CALLBACK) ?? null
            : null;

        const finderPattern = this.findFinderPattern(hints);
        return this.processFinderPattern(finderPattern);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Finder pattern search
    // ──────────────────────────────────────────────────────────────────────────

    private findFinderPattern(hints?: Map<DecodeHintType, any>): MicroQRFinderPattern {
        const image = this.image;
        const maxI = image.getHeight();
        const maxJ = image.getWidth();
        const tryHarder = hints != null && hints.get(DecodeHintType.TRY_HARDER) !== undefined;

        // Skip rows to speed up scan; scanning every row when tryHarder
        const iSkip = tryHarder ? 1 : Math.max(1, Math.floor(maxI / 64));

        const stateCount = new Int32Array(5);
        const possibleCenters: MicroQRFinderPattern[] = [];

        for (let i = iSkip - 1; i < maxI; i += iSkip) {
            stateCount.fill(0);
            let currentState = 0;

            for (let j = 0; j < maxJ; j++) {
                if (image.get(j, i)) {
                    // In a black pixel
                    if (currentState === 1) {
                        stateCount[1]++;
                    } else {
                        if (currentState === 3) {
                            if (this.foundPatternCross(stateCount)) {
                                const confirmed = this.handlePossibleCenter(stateCount, i, j, possibleCenters);
                                if (confirmed) {
                                    stateCount.fill(0);
                                    currentState = 0;
                                    continue;
                                }
                            }
                            stateCount[0] = stateCount[2];
                            stateCount[1] = stateCount[3];
                            stateCount[2] = 1;
                            stateCount[3] = 0;
                            stateCount[4] = 0;
                            currentState = 2;
                        } else {
                            stateCount[++currentState]++;
                        }
                    }
                } else {
                    // In a white pixel
                    if (currentState % 2 === 1) {
                        currentState++;
                    }
                    stateCount[currentState]++;
                }
            }
            if (this.foundPatternCross(stateCount)) {
                this.handlePossibleCenter(stateCount, i, maxJ, possibleCenters);
            }
        }

        if (possibleCenters.length === 0) {
            throw new NotFoundException('No Micro QR finder pattern found.');
        }

        // Return the candidate with the highest count (most confirmations)
        possibleCenters.sort((a, b) => b.getCount() - a.getCount());
        return possibleCenters[0];
    }

    private foundPatternCross(stateCount: Int32Array): boolean {
        let totalModuleSize = 0;
        for (let i = 0; i < 5; i++) {
            const count = stateCount[i];
            if (count === 0) return false;
            totalModuleSize += count;
        }
        if (totalModuleSize < 7) return false;

        const moduleSize = totalModuleSize / 7.0;
        const maxVariance = moduleSize / 2.0;

        return Math.abs(moduleSize - stateCount[0]) < maxVariance &&
            Math.abs(moduleSize - stateCount[1]) < maxVariance &&
            Math.abs(3.0 * moduleSize - stateCount[2]) < 3 * maxVariance &&
            Math.abs(moduleSize - stateCount[3]) < maxVariance &&
            Math.abs(moduleSize - stateCount[4]) < maxVariance;
    }

    private handlePossibleCenter(
        stateCount: Int32Array,
        i: number,
        j: number,
        possibleCenters: MicroQRFinderPattern[]
    ): boolean {
        const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
        const centerJ = this.centerFromEnd(stateCount, j);
        const centerI = this.crossCheckVertical(i, Math.floor(centerJ), stateCount[2], stateCountTotal);
        if (isNaN(centerI)) return false;

        const estimatedModuleSize = (stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4]) / 7.0;

        // Check if this center is near an existing candidate
        for (let idx = 0; idx < possibleCenters.length; idx++) {
            const center = possibleCenters[idx];
            if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
                possibleCenters[idx] = center.combineEstimate(centerI, centerJ, estimatedModuleSize);
                return true;
            }
        }

        possibleCenters.push(new MicroQRFinderPattern(centerJ, centerI, estimatedModuleSize));
        if (this.resultPointCallback !== null) {
            this.resultPointCallback.foundPossibleResultPoint(possibleCenters[possibleCenters.length - 1]);
        }
        return false;
    }

    private centerFromEnd(stateCount: Int32Array, end: number): number {
        return end - stateCount[4] - stateCount[3] - stateCount[2] / 2.0;
    }

    private crossCheckVertical(
        startI: number,
        centerJ: number,
        centralCount: number,
        originalStateCountTotal: number
    ): number {
        const image = this.image;
        const maxI = image.getHeight();
        const stateCount = new Int32Array(5);

        let i = startI;
        while (i >= 0 && image.get(centerJ, i)) { stateCount[2]++; i--; }
        if (i < 0) return NaN;
        while (i >= 0 && !image.get(centerJ, i) && stateCount[1] <= originalStateCountTotal) { stateCount[1]++; i--; }
        if (i < 0 || stateCount[1] > originalStateCountTotal) return NaN;
        while (i >= 0 && image.get(centerJ, i) && stateCount[0] <= originalStateCountTotal) { stateCount[0]++; i--; }
        if (stateCount[0] > originalStateCountTotal) return NaN;

        i = startI + 1;
        while (i < maxI && image.get(centerJ, i)) { stateCount[2]++; i++; }
        if (i === maxI) return NaN;
        while (i < maxI && !image.get(centerJ, i) && stateCount[3] < originalStateCountTotal) { stateCount[3]++; i++; }
        if (i === maxI || stateCount[3] >= originalStateCountTotal) return NaN;
        while (i < maxI && image.get(centerJ, i) && stateCount[4] < originalStateCountTotal) { stateCount[4]++; i++; }
        if (stateCount[4] >= originalStateCountTotal) return NaN;

        const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
        if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) return NaN;

        return this.foundPatternCross(stateCount)
            ? this.centerFromEnd(stateCount, i)
            : NaN;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Process finder pattern → perspective sample
    // ──────────────────────────────────────────────────────────────────────────

    private processFinderPattern(finderPattern: MicroQRFinderPattern): DetectorResult {
        const fx = finderPattern.getX();
        const fy = finderPattern.getY();
        const moduleSize = finderPattern.getEstimatedModuleSize();

        if (moduleSize < 1.0) {
            throw new NotFoundException('Module size too small.');
        }

        // Probe timing patterns in all 4 orientations to determine dimension + direction
        const orientations: Array<{ dx: number; dy: number; dim: number }> = [];

        for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]] as [number, number][]) {
            const dim = this.probeDimension(fx, fy, dx, dy, moduleSize);
            if (dim !== null) {
                orientations.push({ dx, dy, dim });
            }
        }

        if (orientations.length < 2) {
            throw new NotFoundException('Cannot determine Micro QR symbol dimension.');
        }

        // We need two perpendicular directions (row and col).
        // Try pairs: horizontal + vertical
        let rowDir: { dx: number; dy: number; dim: number } | null = null;
        let colDir: { dx: number; dy: number; dim: number } | null = null;

        for (const o of orientations) {
            if (Math.abs(o.dx) > Math.abs(o.dy) && rowDir === null) {
                rowDir = o;
            } else if (Math.abs(o.dy) > Math.abs(o.dx) && colDir === null) {
                colDir = o;
            }
        }

        if (rowDir === null || colDir === null) {
            // Fall back: take the first two orientations
            rowDir = orientations[0];
            colDir = orientations[1];
        }

        // Use consistent dimension (prefer the two that agree or average)
        const dim = rowDir.dim === colDir.dim ? rowDir.dim : Math.round((rowDir.dim + colDir.dim) / 2);
        if (dim !== 11 && dim !== 13 && dim !== 15 && dim !== 17) {
            throw new NotFoundException('Invalid Micro QR dimension: ' + dim);
        }

        // Build 3-point perspective transform:
        //   topLeft = finder center
        //   topRight = topLeft + rowDir * (dim - 3.5) * moduleSize
        //   bottomLeft = topLeft + colDir * (dim - 3.5) * moduleSize
        const dist = (dim - 3.5) * moduleSize;

        const topLeftX = fx;
        const topLeftY = fy;
        const topRightX = fx + rowDir.dx * dist;
        const topRightY = fy + rowDir.dy * dist;
        const bottomLeftX = fx + colDir.dx * dist;
        const bottomLeftY = fy + colDir.dy * dist;

        const transform = MicroQRDetector.createTransform(
            topLeftX, topLeftY,
            topRightX, topRightY,
            bottomLeftX, bottomLeftY,
            dim
        );

        const bits = MicroQRDetector.sampleGrid(this.image, transform, dim);

        const points: ResultPoint[] = [
            new ResultPoint(topLeftX, topLeftY),
            new ResultPoint(topRightX, topRightY),
            new ResultPoint(bottomLeftX, bottomLeftY),
        ];

        return new DetectorResult(bits, points);
    }

    /**
     * Probe the timing pattern in direction (dx, dy) from finder center.
     * Returns the symbol dimension if the timing pattern is consistent, or null.
     *
     * The timing starts 4.5 modules from the finder center (after the 7-module finder + 1 separator).
     * We count light/dark transitions to determine the number of timing modules.
     */
    private probeDimension(
        fx: number, fy: number,
        dx: number, dy: number,
        moduleSize: number
    ): number | null {
        // Step from module 8.5 (center of first timing module) outward
        const startOffset = 8.0 * moduleSize; // col 8 / row 8 center from finder top-left
        const maxSteps = 10; // M4 has 9 timing modules

        // Find first timing module position
        const startX = fx + dx * (startOffset - 3.5 * moduleSize);
        const startY = fy + dy * (startOffset - 3.5 * moduleSize);

        if (startX < 0 || startX >= this.image.getWidth() ||
            startY < 0 || startY >= this.image.getHeight()) {
            return null;
        }

        // Count modules in the timing strip starting from the first timing module
        // Timing starts at col/row 8, which is the dark module at the junction
        let count = 8; // modules 0-7 are the finder+sep area
        let x = startX;
        let y = startY;

        for (let step = 0; step < maxSteps; step++) {
            const xi = Math.round(x);
            const yi = Math.round(y);
            if (xi < 0 || xi >= this.image.getWidth() || yi < 0 || yi >= this.image.getHeight()) {
                break;
            }
            count++;
            x += dx * moduleSize;
            y += dy * moduleSize;
        }

        // Validate dimension
        if (count === 11 || count === 13 || count === 15 || count === 17) {
            return count;
        }

        // Round to nearest valid
        const nearest = [11, 13, 15, 17].reduce((prev, curr) =>
            Math.abs(curr - count) < Math.abs(prev - count) ? curr : prev
        );

        if (Math.abs(nearest - count) <= 2) {
            return nearest;
        }

        return null;
    }

    private static createTransform(
        topLeftX: number, topLeftY: number,
        topRightX: number, topRightY: number,
        bottomLeftX: number, bottomLeftY: number,
        dimension: number
    ): PerspectiveTransform {
        const dimMinusThree = dimension - 3.5;

        return PerspectiveTransform.quadrilateralToQuadrilateral(
            3.5, 3.5,           // source top-left (finder center in ideal grid)
            dimMinusThree, 3.5, // source top-right
            3.5, dimMinusThree, // source bottom-left
            dimMinusThree, dimMinusThree, // source bottom-right (estimated)
            topLeftX, topLeftY,
            topRightX, topRightY,
            bottomLeftX, bottomLeftY,
            // bottom-right: project both directions
            topRightX + (bottomLeftX - topLeftX),
            topRightY + (bottomLeftY - topLeftY)
        );
    }

    private static sampleGrid(
        image: BitMatrix,
        transform: PerspectiveTransform,
        dimension: number
    ): BitMatrix {
        const sampler = GridSamplerInstance.getInstance();
        return sampler.sampleGridWithTransform(image, dimension, dimension, transform);
    }
}
