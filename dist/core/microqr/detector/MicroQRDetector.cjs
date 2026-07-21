'use strict';

var DetectorResult = require('../../common/DetectorResult');
var GridSamplerInstance = require('../../common/GridSamplerInstance');
var PerspectiveTransform = require('../../common/PerspectiveTransform');
var DecodeHintType = require('../../DecodeHintType');
var NotFoundException = require('../../NotFoundException');
var ResultPoint = require('../../ResultPoint');
var MicroQRFinderPattern = require('./MicroQRFinderPattern');

class MicroQRDetector {
  constructor(image) {
    this.image = image;
  }
  image;
  resultPointCallback;
  detect(hints) {
    this.resultPointCallback = hints != null ? hints.get(DecodeHintType.DecodeHintType.NEED_RESULT_POINT_CALLBACK) ?? null : null;
    const finderPattern = this.findFinderPattern(hints);
    return this.processFinderPattern(finderPattern);
  }
  // ──────────────────────────────────────────────────────────────────────────
  // Finder pattern search
  // ──────────────────────────────────────────────────────────────────────────
  findFinderPattern(hints) {
    const image = this.image;
    const maxI = image.getHeight();
    const maxJ = image.getWidth();
    const tryHarder = hints != null && hints.get(DecodeHintType.DecodeHintType.TRY_HARDER) !== void 0;
    const iSkip = tryHarder ? 1 : Math.max(1, Math.floor(maxI / 64));
    const stateCount = new Int32Array(5);
    const possibleCenters = [];
    for (let i = iSkip - 1; i < maxI; i += iSkip) {
      stateCount.fill(0);
      let currentState = 0;
      for (let j = 0; j < maxJ; j++) {
        if (image.get(j, i)) {
          if ((currentState & 1) === 1) {
            currentState++;
          }
          stateCount[currentState]++;
        } else {
          if ((currentState & 1) === 0) {
            if (currentState === 4) {
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
              stateCount[2] = stateCount[4];
              stateCount[3] = 1;
              stateCount[4] = 0;
              currentState = 3;
              continue;
            } else {
              stateCount[++currentState]++;
            }
          } else {
            stateCount[currentState]++;
          }
        }
      }
      if (this.foundPatternCross(stateCount)) {
        this.handlePossibleCenter(stateCount, i, maxJ, possibleCenters);
      }
    }
    if (possibleCenters.length === 0) {
      throw new NotFoundException.NotFoundException("No Micro QR finder pattern found.");
    }
    possibleCenters.sort((a, b) => b.getCount() - a.getCount());
    return possibleCenters[0];
  }
  foundPatternCross(stateCount) {
    let totalModuleSize = 0;
    for (let i = 0; i < 5; i++) {
      const count = stateCount[i];
      if (count === 0) return false;
      totalModuleSize += count;
    }
    if (totalModuleSize < 7) return false;
    const moduleSize = totalModuleSize / 7;
    const maxVariance = moduleSize / 2;
    return Math.abs(moduleSize - stateCount[0]) < maxVariance && Math.abs(moduleSize - stateCount[1]) < maxVariance && Math.abs(3 * moduleSize - stateCount[2]) < 3 * maxVariance && Math.abs(moduleSize - stateCount[3]) < maxVariance && Math.abs(moduleSize - stateCount[4]) < maxVariance;
  }
  handlePossibleCenter(stateCount, i, j, possibleCenters) {
    const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
    const centerJ = this.centerFromEnd(stateCount, j);
    const centerI = this.crossCheckVertical(i, Math.floor(centerJ), stateCount[2], stateCountTotal);
    if (isNaN(centerI)) return false;
    const estimatedModuleSize = (stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4]) / 7;
    for (let idx = 0; idx < possibleCenters.length; idx++) {
      const center = possibleCenters[idx];
      if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
        possibleCenters[idx] = center.combineEstimate(centerI, centerJ, estimatedModuleSize);
        return true;
      }
    }
    possibleCenters.push(new MicroQRFinderPattern.MicroQRFinderPattern(centerJ, centerI, estimatedModuleSize));
    if (this.resultPointCallback !== null) {
      this.resultPointCallback.foundPossibleResultPoint(possibleCenters[possibleCenters.length - 1]);
    }
    return false;
  }
  centerFromEnd(stateCount, end) {
    return end - stateCount[4] - stateCount[3] - stateCount[2] / 2;
  }
  crossCheckVertical(startI, centerJ, centralCount, originalStateCountTotal) {
    const image = this.image;
    const maxI = image.getHeight();
    const stateCount = new Int32Array(5);
    let i = startI;
    while (i >= 0 && image.get(centerJ, i)) {
      stateCount[2]++;
      i--;
    }
    if (i < 0) return NaN;
    while (i >= 0 && !image.get(centerJ, i) && stateCount[1] <= originalStateCountTotal) {
      stateCount[1]++;
      i--;
    }
    if (i < 0 || stateCount[1] > originalStateCountTotal) return NaN;
    while (i >= 0 && image.get(centerJ, i) && stateCount[0] <= originalStateCountTotal) {
      stateCount[0]++;
      i--;
    }
    if (stateCount[0] > originalStateCountTotal) return NaN;
    i = startI + 1;
    while (i < maxI && image.get(centerJ, i)) {
      stateCount[2]++;
      i++;
    }
    if (i === maxI) return NaN;
    while (i < maxI && !image.get(centerJ, i) && stateCount[3] < originalStateCountTotal) {
      stateCount[3]++;
      i++;
    }
    if (i === maxI || stateCount[3] >= originalStateCountTotal) return NaN;
    while (i < maxI && image.get(centerJ, i) && stateCount[4] < originalStateCountTotal) {
      stateCount[4]++;
      i++;
    }
    if (stateCount[4] >= originalStateCountTotal) return NaN;
    const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
    if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) return NaN;
    return this.foundPatternCross(stateCount) ? this.centerFromEnd(stateCount, i) : NaN;
  }
  // ──────────────────────────────────────────────────────────────────────────
  // Process finder pattern → perspective sample
  // ──────────────────────────────────────────────────────────────────────────
  processFinderPattern(finderPattern) {
    const fx = finderPattern.getX();
    const fy = finderPattern.getY();
    const moduleSize = finderPattern.getEstimatedModuleSize();
    if (moduleSize < 1) {
      throw new NotFoundException.NotFoundException("Module size too small.");
    }
    const detected = this.determineDimension(fx, fy, moduleSize);
    if (detected === null) {
      throw new NotFoundException.NotFoundException("Cannot determine Micro QR symbol dimension.");
    }
    const { dim, orientation } = detected;
    const dist = (dim - 7) * moduleSize;
    const trDx = [dist, 0, -dist, 0][orientation];
    const trDy = [0, dist, 0, -dist][orientation];
    const blDx = [0, -dist, 0, dist][orientation];
    const blDy = [dist, 0, -dist, 0][orientation];
    const topRightX = fx + trDx;
    const topRightY = fy + trDy;
    const bottomLeftX = fx + blDx;
    const bottomLeftY = fy + blDy;
    const transform = MicroQRDetector.createTransform(
      fx,
      fy,
      topRightX,
      topRightY,
      bottomLeftX,
      bottomLeftY,
      dim
    );
    const bits = MicroQRDetector.sampleGrid(this.image, transform, dim);
    const points = [
      new ResultPoint.ResultPoint(fx, fy),
      new ResultPoint.ResultPoint(topRightX, topRightY),
      new ResultPoint.ResultPoint(bottomLeftX, bottomLeftY)
    ];
    return new DetectorResult.DetectorResult(bits, points);
  }
  /**
   * Determine the Micro QR symbol dimension and orientation by probing timing patterns.
   *
   * The timing pattern in row 0 (cols 8+) and col 0 (rows 8+) each alternate dark/light.
   * From the finder center (fx, fy) the timing probes rotate with the symbol orientation:
   *
   *   orientation 0 (0°):    row probe (+5,-3)→right,  col probe (-3,+5)→down
   *   orientation 1 (90°CW): row probe (+3,+5)→down,   col probe (-5,-3)→left
   *   orientation 2 (180°):  row probe (-5,+3)→left,   col probe (+3,-5)→up
   *   orientation 3 (270°CW):row probe (-3,-5)→up,     col probe (+5,+3)→right
   */
  determineDimension(fx, fy, ms) {
    const ORIENTATION_PROBES = [
      [5, -3, 1, 0, -3, 5, 0, 1],
      // 0°
      [3, 5, 0, 1, -5, -3, -1, 0],
      // 90° CW
      [-5, 3, -1, 0, 3, -5, 0, -1],
      // 180°
      [-3, -5, 0, -1, 5, 3, 1, 0]
      // 270° CW
    ];
    let bestSingle = null;
    for (let orientation = 0; orientation < 4; orientation++) {
      const [rDx, rDy, rdx, rdy, cDx, cDy, cdx, cdy] = ORIENTATION_PROBES[orientation];
      const dimH = this.probeTimingLine(fx + rDx * ms, fy + rDy * ms, rdx, rdy, ms);
      const dimV = this.probeTimingLine(fx + cDx * ms, fy + cDy * ms, cdx, cdy, ms);
      if (dimH !== null && dimV !== null) {
        const dim = this.snapDimension(dimH, dimV);
        if (dim !== null) {
          return { dim, orientation };
        }
      } else if (bestSingle === null && (dimH !== null || dimV !== null)) {
        const dim = this.snapDimension(dimH, dimV);
        if (dim !== null) {
          bestSingle = { dim, orientation };
        }
      }
    }
    return bestSingle;
  }
  snapDimension(dimH, dimV) {
    if (dimH === null) return dimV;
    if (dimV === null) return dimH;
    if (dimH === dimV) return dimH;
    const avg = Math.round((dimH + dimV) / 2);
    const nearest = [11, 13, 15, 17].reduce(
      (prev, curr) => Math.abs(curr - avg) < Math.abs(prev - avg) ? curr : prev
    );
    return nearest;
  }
  /**
   * Probe the timing pattern starting at (startX, startY), stepping by moduleSize in (dx, dy).
   * Counts dark timing modules (at even-indexed positions 8, 10, 12, ...) and stops at mismatch.
   *
   * Returns the symbol dimension, or null if no valid dimension is detected.
   */
  probeTimingLine(startX, startY, dx, dy, moduleSize) {
    let darkCount = 0;
    for (let step = 0; step < 10; step++) {
      const moduleIdx = 8 + step;
      const x = Math.round(startX + dx * step * moduleSize);
      const y = Math.round(startY + dy * step * moduleSize);
      if (x < 0 || x >= this.image.getWidth() || y < 0 || y >= this.image.getHeight()) {
        break;
      }
      const isDark = this.image.get(x, y);
      const expectDark = moduleIdx % 2 === 0;
      if (isDark !== expectDark) {
        break;
      }
      if (expectDark) {
        darkCount++;
      }
    }
    if (darkCount < 2) return null;
    const dim = 8 + 2 * darkCount - 1;
    if (dim === 11 || dim === 13 || dim === 15 || dim === 17) {
      return dim;
    }
    const nearest = [11, 13, 15, 17].reduce(
      (prev, curr) => Math.abs(curr - dim) < Math.abs(prev - dim) ? curr : prev
    );
    return Math.abs(nearest - dim) <= 2 ? nearest : null;
  }
  static createTransform(topLeftX, topLeftY, topRightX, topRightY, bottomLeftX, bottomLeftY, dimension) {
    const dimMinusThree = dimension - 3.5;
    return PerspectiveTransform.PerspectiveTransform.quadrilateralToQuadrilateral(
      3.5,
      3.5,
      // source top-left (finder center in ideal grid)
      dimMinusThree,
      3.5,
      // source top-right
      3.5,
      dimMinusThree,
      // source bottom-left
      dimMinusThree,
      dimMinusThree,
      // source bottom-right (estimated)
      topLeftX,
      topLeftY,
      topRightX,
      topRightY,
      bottomLeftX,
      bottomLeftY,
      // bottom-right: project both directions from top-left
      topRightX + (bottomLeftX - topLeftX),
      topRightY + (bottomLeftY - topLeftY)
    );
  }
  static sampleGrid(image, transform, dimension) {
    const sampler = GridSamplerInstance.GridSamplerInstance.getInstance();
    return sampler.sampleGridWithTransform(image, dimension, dimension, transform);
  }
}

exports.MicroQRDetector = MicroQRDetector;
//# sourceMappingURL=MicroQRDetector.cjs.map
//# sourceMappingURL=MicroQRDetector.cjs.map