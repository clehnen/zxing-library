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
 *   1. Scan rows for 1:1:3:1:1 ratio black/white/black/white/black run (finder pattern).
 *   2. Cross-check candidate vertically.
 *   3. Estimate module size from the cross-section of the finder.
 *   4. Probe timing patterns (row 0 and col 0) from the finder to determine symbol dimension.
 *   5. Build perspective transform from 3 anchor points.
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

        // Skip rows to speed up scan; scan every row when tryHarder
        const iSkip = tryHarder ? 1 : Math.max(1, Math.floor(maxI / 64));

        const stateCount = new Int32Array(5);
        const possibleCenters: MicroQRFinderPattern[] = [];

        for (let i = iSkip - 1; i < maxI; i += iSkip) {
            stateCount.fill(0);
            let currentState = 0;

            for (let j = 0; j < maxJ; j++) {
                if (image.get(j, i)) {
                    // Dark pixel
                    if ((currentState & 1) === 1) {
                        // Transition from white-counting state to dark-counting state
                        currentState++;
                    }
                    stateCount[currentState]++;
                } else {
                    // White pixel
                    if ((currentState & 1) === 0) {
                        // Currently in a dark-counting state
                        if (currentState === 4) {
                            // Potential complete pattern — check it
                            if (this.foundPatternCross(stateCount)) {
                                const confirmed = this.handlePossibleCenter(stateCount, i, j, possibleCenters);
                                if (confirmed) {
                                    stateCount.fill(0);
                                    currentState = 0;
                                    continue;
                                }
                            }
                            // Slide the window forward by two states
                            stateCount[0] = stateCount[2];
                            stateCount[1] = stateCount[3];
                            stateCount[2] = stateCount[4];
                            stateCount[3] = 1;
                            stateCount[4] = 0;
                            currentState = 3;
                            continue;
                        } else {
                            // Transition from dark-counting to white-counting
                            stateCount[++currentState]++;
                        }
                    } else {
                        // Already in a white-counting state, just count
                        stateCount[currentState]++;
                    }
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

        const dim = this.determineDimension(fx, fy, moduleSize);
        if (dim === null) {
            throw new NotFoundException('Cannot determine Micro QR symbol dimension.');
        }

        // Map source module (dim-4, 3) to image: (dim-7) modules right and (dim-7) down of finder center.
        // In the createTransform source, this anchor is at (dim-3.5, 3.5) which is (dim-7) units
        // from the finder center source point (3.5, 3.5).
        const dist = (dim - 7) * moduleSize;

        const topLeftX = fx;
        const topLeftY = fy;
        const topRightX = fx + dist;
        const topRightY = fy;
        const bottomLeftX = fx;
        const bottomLeftY = fy + dist;

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
     * Determine the Micro QR symbol dimension by probing the timing patterns.
     *
     * The timing pattern in row 0 runs from column 8 to dim-1.
     * The timing pattern in col 0 runs from row 8 to dim-1.
     * Both start with a dark module (even index) and alternate.
     *
     * Module (col, row) center in image = (fx - 3.5*ms + (col+0.5)*ms, fy - 3.5*ms + (row+0.5)*ms)
     * Timing row 0, col 8: x = fx + 5.0*ms, y = fy - 3.0*ms
     * Timing col 0, row 8: x = fx - 3.0*ms, y = fy + 5.0*ms
     */
    private determineDimension(fx: number, fy: number, moduleSize: number): number | null {
        const timingRowY = fy - 3.0 * moduleSize;
        const timingStartX = fx + 5.0 * moduleSize;
        const dimH = this.probeTimingLine(timingStartX, timingRowY, 1, 0, moduleSize);

        const timingColX = fx - 3.0 * moduleSize;
        const timingStartY = fy + 5.0 * moduleSize;
        const dimV = this.probeTimingLine(timingColX, timingStartY, 0, 1, moduleSize);

        if (dimH === null && dimV === null) return null;
        if (dimH === null) return dimV;
        if (dimV === null) return dimH;

        // Both found: prefer agreement, otherwise round average
        if (dimH === dimV) return dimH;
        const avg = Math.round((dimH + dimV) / 2);
        const nearest = [11, 13, 15, 17].reduce((prev, curr) =>
            Math.abs(curr - avg) < Math.abs(prev - avg) ? curr : prev
        );
        return nearest;
    }

    /**
     * Probe the timing pattern starting at (startX, startY), stepping by moduleSize in (dx, dy).
     * Counts dark timing modules (at even-indexed positions 8, 10, 12, ...) and stops at mismatch.
     *
     * Returns the symbol dimension, or null if no valid dimension is detected.
     */
    private probeTimingLine(
        startX: number,
        startY: number,
        dx: number,
        dy: number,
        moduleSize: number
    ): number | null {
        let darkCount = 0;

        for (let step = 0; step < 10; step++) {
            const moduleIdx = 8 + step;
            const x = Math.round(startX + dx * step * moduleSize);
            const y = Math.round(startY + dy * step * moduleSize);

            if (x < 0 || x >= this.image.getWidth() || y < 0 || y >= this.image.getHeight()) {
                break;
            }

            const isDark = this.image.get(x, y);
            const expectDark = (moduleIdx % 2 === 0);

            if (isDark !== expectDark) {
                break;
            }

            if (expectDark) {
                darkCount++;
            }
        }

        if (darkCount < 2) return null;

        // dim = finder(7) + separator(1) + timing(2*darkCount - 1)
        const dim = 8 + 2 * darkCount - 1;

        if (dim === 11 || dim === 13 || dim === 15 || dim === 17) {
            return dim;
        }

        // Round to nearest valid dimension
        const nearest = [11, 13, 15, 17].reduce((prev, curr) =>
            Math.abs(curr - dim) < Math.abs(prev - dim) ? curr : prev
        );

        return Math.abs(nearest - dim) <= 2 ? nearest : null;
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
            // bottom-right: project both directions from top-left
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
