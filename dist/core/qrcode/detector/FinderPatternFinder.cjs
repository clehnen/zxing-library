'use strict';

var DecodeHintType = require('../../DecodeHintType');
var ResultPoint = require('../../ResultPoint');
var FinderPattern = require('./FinderPattern');
var FinderPatternInfo = require('./FinderPatternInfo');
var NotFoundException = require('../../NotFoundException');

class FinderPatternFinder {
  /**
   * <p>Creates a finder that will search the image for three finder patterns.</p>
   *
   * @param image image to search
   */
  // public constructor(image: BitMatrix) {
  //   this(image, null)
  // }
  constructor(image, resultPointCallback) {
    this.image = image;
    this.resultPointCallback = resultPointCallback;
    this.possibleCenters = [];
    this.crossCheckStateCount = new Int32Array(5);
    this.resultPointCallback = resultPointCallback;
  }
  image;
  resultPointCallback;
  static CENTER_QUORUM = 2;
  static MIN_SKIP = 3;
  // 1 pixel/module times 3 modules/center
  static MAX_MODULES = 57;
  // support up to version 10 for mobile clients
  possibleCenters;
  hasSkipped;
  crossCheckStateCount;
  getImage() {
    return this.image;
  }
  getPossibleCenters() {
    return this.possibleCenters;
  }
  find(hints) {
    const tryHarder = hints !== null && hints !== void 0 && void 0 !== hints.get(DecodeHintType.DecodeHintType.TRY_HARDER);
    const pureBarcode = hints !== null && hints !== void 0 && void 0 !== hints.get(DecodeHintType.DecodeHintType.PURE_BARCODE);
    const image = this.image;
    const maxI = image.getHeight();
    const maxJ = image.getWidth();
    let iSkip = Math.floor(3 * maxI / (4 * FinderPatternFinder.MAX_MODULES));
    if (iSkip < FinderPatternFinder.MIN_SKIP || tryHarder) {
      iSkip = FinderPatternFinder.MIN_SKIP;
    }
    let done = false;
    const stateCount = new Int32Array(5);
    for (let i = iSkip - 1; i < maxI && !done; i += iSkip) {
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
              if (FinderPatternFinder.foundPatternCross(stateCount)) {
                const confirmed = this.handlePossibleCenter(stateCount, i, j, pureBarcode);
                if (confirmed === true) {
                  iSkip = 2;
                  if (this.hasSkipped === true) {
                    done = this.haveMultiplyConfirmedCenters();
                  } else {
                    const rowSkip = this.findRowSkip();
                    if (rowSkip > stateCount[2]) {
                      i += rowSkip - stateCount[2] - iSkip;
                      j = maxJ - 1;
                    }
                  }
                } else {
                  stateCount[0] = stateCount[2];
                  stateCount[1] = stateCount[3];
                  stateCount[2] = stateCount[4];
                  stateCount[3] = 1;
                  stateCount[4] = 0;
                  currentState = 3;
                  continue;
                }
                currentState = 0;
                stateCount.fill(0);
              } else {
                stateCount[0] = stateCount[2];
                stateCount[1] = stateCount[3];
                stateCount[2] = stateCount[4];
                stateCount[3] = 1;
                stateCount[4] = 0;
                currentState = 3;
              }
            } else {
              stateCount[++currentState]++;
            }
          } else {
            stateCount[currentState]++;
          }
        }
      }
      if (FinderPatternFinder.foundPatternCross(stateCount)) {
        const confirmed = this.handlePossibleCenter(stateCount, i, maxJ, pureBarcode);
        if (confirmed === true) {
          iSkip = stateCount[0];
          if (this.hasSkipped) {
            done = this.haveMultiplyConfirmedCenters();
          }
        }
      }
    }
    const patternInfo = this.selectBestPatterns();
    ResultPoint.ResultPoint.orderBestPatterns(patternInfo);
    return new FinderPatternInfo.FinderPatternInfo(patternInfo);
  }
  /**
   * Given a count of black/white/black/white/black pixels just seen and an end position,
   * figures the location of the center of this run.
   */
  static centerFromEnd(stateCount, end) {
    return end - stateCount[4] - stateCount[3] - stateCount[2] / 2;
  }
  /**
   * @param stateCount count of black/white/black/white/black pixels just read
   * @return true iff the proportions of the counts is close enough to the 1/1/3/1/1 ratios
   *         used by finder patterns to be considered a match
   */
  static foundPatternCross(stateCount) {
    let totalModuleSize = 0;
    for (let i = 0; i < 5; i++) {
      const count = stateCount[i];
      if (count === 0) {
        return false;
      }
      totalModuleSize += count;
    }
    if (totalModuleSize < 7) {
      return false;
    }
    const moduleSize = totalModuleSize / 7;
    const maxVariance = moduleSize / 2;
    return Math.abs(moduleSize - stateCount[0]) < maxVariance && Math.abs(moduleSize - stateCount[1]) < maxVariance && Math.abs(3 * moduleSize - stateCount[2]) < 3 * maxVariance && Math.abs(moduleSize - stateCount[3]) < maxVariance && Math.abs(moduleSize - stateCount[4]) < maxVariance;
  }
  getCrossCheckStateCount() {
    this.crossCheckStateCount.fill(0);
    return this.crossCheckStateCount;
  }
  /**
   * After a vertical and horizontal scan finds a potential finder pattern, this method
   * "cross-cross-cross-checks" by scanning down diagonally through the center of the possible
   * finder pattern to see if the same proportion is detected.
   *
   * @param startI row where a finder pattern was detected
   * @param centerJ center of the section that appears to cross a finder pattern
   * @param maxCount maximum reasonable number of modules that should be
   *  observed in any reading state, based on the results of the horizontal scan
   * @param originalStateCountTotal The original state count total.
   * @return true if proportions are withing expected limits
   */
  crossCheckDiagonal(startI, centerJ, maxCount, originalStateCountTotal) {
    const stateCount = this.getCrossCheckStateCount();
    let i = 0;
    const image = this.image;
    while (startI >= i && centerJ >= i && image.get(centerJ - i, startI - i)) {
      stateCount[2]++;
      i++;
    }
    if (startI < i || centerJ < i) {
      return false;
    }
    while (startI >= i && centerJ >= i && !image.get(centerJ - i, startI - i) && stateCount[1] <= maxCount) {
      stateCount[1]++;
      i++;
    }
    if (startI < i || centerJ < i || stateCount[1] > maxCount) {
      return false;
    }
    while (startI >= i && centerJ >= i && image.get(centerJ - i, startI - i) && stateCount[0] <= maxCount) {
      stateCount[0]++;
      i++;
    }
    if (stateCount[0] > maxCount) {
      return false;
    }
    const maxI = image.getHeight();
    const maxJ = image.getWidth();
    i = 1;
    while (startI + i < maxI && centerJ + i < maxJ && image.get(centerJ + i, startI + i)) {
      stateCount[2]++;
      i++;
    }
    if (startI + i >= maxI || centerJ + i >= maxJ) {
      return false;
    }
    while (startI + i < maxI && centerJ + i < maxJ && !image.get(centerJ + i, startI + i) && stateCount[3] < maxCount) {
      stateCount[3]++;
      i++;
    }
    if (startI + i >= maxI || centerJ + i >= maxJ || stateCount[3] >= maxCount) {
      return false;
    }
    while (startI + i < maxI && centerJ + i < maxJ && image.get(centerJ + i, startI + i) && stateCount[4] < maxCount) {
      stateCount[4]++;
      i++;
    }
    if (stateCount[4] >= maxCount) {
      return false;
    }
    const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
    return Math.abs(stateCountTotal - originalStateCountTotal) < 2 * originalStateCountTotal && FinderPatternFinder.foundPatternCross(stateCount);
  }
  /**
   * <p>After a horizontal scan finds a potential finder pattern, this method
   * "cross-checks" by scanning down vertically through the center of the possible
   * finder pattern to see if the same proportion is detected.</p>
   *
   * @param startI row where a finder pattern was detected
   * @param centerJ center of the section that appears to cross a finder pattern
   * @param maxCount maximum reasonable number of modules that should be
   * observed in any reading state, based on the results of the horizontal scan
   * @return vertical center of finder pattern, or {@link Float#NaN} if not found
   */
  crossCheckVertical(startI, centerJ, maxCount, originalStateCountTotal) {
    const image = this.image;
    const maxI = image.getHeight();
    const stateCount = this.getCrossCheckStateCount();
    let i = startI;
    while (i >= 0 && image.get(centerJ, i)) {
      stateCount[2]++;
      i--;
    }
    if (i < 0) {
      return NaN;
    }
    while (i >= 0 && !image.get(centerJ, i) && stateCount[1] <= maxCount) {
      stateCount[1]++;
      i--;
    }
    if (i < 0 || stateCount[1] > maxCount) {
      return NaN;
    }
    while (i >= 0 && image.get(centerJ, i) && stateCount[0] <= maxCount) {
      stateCount[0]++;
      i--;
    }
    if (stateCount[0] > maxCount) {
      return NaN;
    }
    i = startI + 1;
    while (i < maxI && image.get(centerJ, i)) {
      stateCount[2]++;
      i++;
    }
    if (i === maxI) {
      return NaN;
    }
    while (i < maxI && !image.get(centerJ, i) && stateCount[3] < maxCount) {
      stateCount[3]++;
      i++;
    }
    if (i === maxI || stateCount[3] >= maxCount) {
      return NaN;
    }
    while (i < maxI && image.get(centerJ, i) && stateCount[4] < maxCount) {
      stateCount[4]++;
      i++;
    }
    if (stateCount[4] >= maxCount) {
      return NaN;
    }
    const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
    if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) {
      return NaN;
    }
    return FinderPatternFinder.foundPatternCross(stateCount) ? FinderPatternFinder.centerFromEnd(stateCount, i) : NaN;
  }
  /**
   * <p>Like {@link #crossCheckVertical(int, int, int, int)}, and in fact is basically identical,
   * except it reads horizontally instead of vertically. This is used to cross-cross
   * check a vertical cross check and locate the real center of the alignment pattern.</p>
   */
  crossCheckHorizontal(startJ, centerI, maxCount, originalStateCountTotal) {
    const image = this.image;
    const maxJ = image.getWidth();
    const stateCount = this.getCrossCheckStateCount();
    let j = startJ;
    while (j >= 0 && image.get(j, centerI)) {
      stateCount[2]++;
      j--;
    }
    if (j < 0) {
      return NaN;
    }
    while (j >= 0 && !image.get(j, centerI) && stateCount[1] <= maxCount) {
      stateCount[1]++;
      j--;
    }
    if (j < 0 || stateCount[1] > maxCount) {
      return NaN;
    }
    while (j >= 0 && image.get(j, centerI) && stateCount[0] <= maxCount) {
      stateCount[0]++;
      j--;
    }
    if (stateCount[0] > maxCount) {
      return NaN;
    }
    j = startJ + 1;
    while (j < maxJ && image.get(j, centerI)) {
      stateCount[2]++;
      j++;
    }
    if (j === maxJ) {
      return NaN;
    }
    while (j < maxJ && !image.get(j, centerI) && stateCount[3] < maxCount) {
      stateCount[3]++;
      j++;
    }
    if (j === maxJ || stateCount[3] >= maxCount) {
      return NaN;
    }
    while (j < maxJ && image.get(j, centerI) && stateCount[4] < maxCount) {
      stateCount[4]++;
      j++;
    }
    if (stateCount[4] >= maxCount) {
      return NaN;
    }
    const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
    if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= originalStateCountTotal) {
      return NaN;
    }
    return FinderPatternFinder.foundPatternCross(stateCount) ? FinderPatternFinder.centerFromEnd(stateCount, j) : NaN;
  }
  /**
   * <p>This is called when a horizontal scan finds a possible alignment pattern. It will
   * cross check with a vertical scan, and if successful, will, ah, cross-cross-check
   * with another horizontal scan. This is needed primarily to locate the real horizontal
   * center of the pattern in cases of extreme skew.
   * And then we cross-cross-cross check with another diagonal scan.</p>
   *
   * <p>If that succeeds the finder pattern location is added to a list that tracks
   * the number of times each location has been nearly-matched as a finder pattern.
   * Each additional find is more evidence that the location is in fact a finder
   * pattern center
   *
   * @param stateCount reading state module counts from horizontal scan
   * @param i row where finder pattern may be found
   * @param j end of possible finder pattern in row
   * @param pureBarcode true if in "pure barcode" mode
   * @return true if a finder pattern candidate was found this time
   */
  handlePossibleCenter(stateCount, i, j, pureBarcode) {
    const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
    let centerJ = FinderPatternFinder.centerFromEnd(stateCount, j);
    let centerI = this.crossCheckVertical(
      i,
      /*(int) */
      Math.floor(centerJ),
      stateCount[2],
      stateCountTotal
    );
    if (!isNaN(centerI)) {
      centerJ = this.crossCheckHorizontal(
        /*(int) */
        Math.floor(centerJ),
        /*(int) */
        Math.floor(centerI),
        stateCount[2],
        stateCountTotal
      );
      if (!isNaN(centerJ) && (!pureBarcode || this.crossCheckDiagonal(
        /*(int) */
        Math.floor(centerI),
        /*(int) */
        Math.floor(centerJ),
        stateCount[2],
        stateCountTotal
      ))) {
        const estimatedModuleSize = stateCountTotal / 7;
        let found = false;
        const possibleCenters = this.possibleCenters;
        for (let index = 0, length = possibleCenters.length; index < length; index++) {
          const center = possibleCenters[index];
          if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
            possibleCenters[index] = center.combineEstimate(centerI, centerJ, estimatedModuleSize);
            found = true;
            break;
          }
        }
        if (!found) {
          const point = new FinderPattern.FinderPattern(centerJ, centerI, estimatedModuleSize);
          possibleCenters.push(point);
          if (this.resultPointCallback !== null && this.resultPointCallback !== void 0) {
            this.resultPointCallback.foundPossibleResultPoint(point);
          }
        }
        return true;
      }
    }
    return false;
  }
  /**
   * @return number of rows we could safely skip during scanning, based on the first
   *         two finder patterns that have been located. In some cases their position will
   *         allow us to infer that the third pattern must lie below a certain point farther
   *         down in the image.
   */
  findRowSkip() {
    const max = this.possibleCenters.length;
    if (max <= 1) {
      return 0;
    }
    let firstConfirmedCenter = null;
    for (const center of this.possibleCenters) {
      if (center.getCount() >= FinderPatternFinder.CENTER_QUORUM) {
        if (firstConfirmedCenter == null) {
          firstConfirmedCenter = center;
        } else {
          this.hasSkipped = true;
          return (
            /*(int) */
            Math.floor((Math.abs(firstConfirmedCenter.getX() - center.getX()) - Math.abs(firstConfirmedCenter.getY() - center.getY())) / 2)
          );
        }
      }
    }
    return 0;
  }
  /**
   * @return true iff we have found at least 3 finder patterns that have been detected
   *         at least {@link #CENTER_QUORUM} times each, and, the estimated module size of the
   *         candidates is "pretty similar"
   */
  haveMultiplyConfirmedCenters() {
    let confirmedCount = 0;
    let totalModuleSize = 0;
    const max = this.possibleCenters.length;
    for (const pattern of this.possibleCenters) {
      if (pattern.getCount() >= FinderPatternFinder.CENTER_QUORUM) {
        confirmedCount++;
        totalModuleSize += pattern.getEstimatedModuleSize();
      }
    }
    if (confirmedCount < 3) {
      return false;
    }
    const average = totalModuleSize / max;
    let totalDeviation = 0;
    for (const pattern of this.possibleCenters) {
      totalDeviation += Math.abs(pattern.getEstimatedModuleSize() - average);
    }
    return totalDeviation <= 0.05 * totalModuleSize;
  }
  /**
   * @return the 3 best {@link FinderPattern}s from our list of candidates. The "best" are
   *         those that have been detected at least {@link #CENTER_QUORUM} times, and whose module
   *         size differs from the average among those patterns the least
   * @throws NotFoundException if 3 such finder patterns do not exist
   */
  selectBestPatterns() {
    const startSize = this.possibleCenters.length;
    if (startSize < 3) {
      throw new NotFoundException.NotFoundException();
    }
    const possibleCenters = this.possibleCenters;
    let average;
    if (startSize > 3) {
      let totalModuleSize = 0;
      let square = 0;
      for (const center of this.possibleCenters) {
        const size = center.getEstimatedModuleSize();
        totalModuleSize += size;
        square += size * size;
      }
      average = totalModuleSize / startSize;
      let stdDev = Math.sqrt(square / startSize - average * average);
      possibleCenters.sort(
        /**
         * <p>Orders by furthest from average</p>
         */
        // FurthestFromAverageComparator implements Comparator<FinderPattern>
        (center1, center2) => {
          const dA = Math.abs(center2.getEstimatedModuleSize() - average);
          const dB = Math.abs(center1.getEstimatedModuleSize() - average);
          return dA < dB ? -1 : dA > dB ? 1 : 0;
        }
      );
      const limit = Math.max(0.2 * average, stdDev);
      for (let i = 0; i < possibleCenters.length && possibleCenters.length > 3; i++) {
        const pattern = possibleCenters[i];
        if (Math.abs(pattern.getEstimatedModuleSize() - average) > limit) {
          possibleCenters.splice(i, 1);
          i--;
        }
      }
    }
    if (possibleCenters.length > 3) {
      let totalModuleSize = 0;
      for (const possibleCenter of possibleCenters) {
        totalModuleSize += possibleCenter.getEstimatedModuleSize();
      }
      average = totalModuleSize / possibleCenters.length;
      possibleCenters.sort(
        /**
         * <p>Orders by {@link FinderPattern#getCount()}, descending.</p>
         */
        // CenterComparator implements Comparator<FinderPattern>
        (center1, center2) => {
          if (center2.getCount() === center1.getCount()) {
            const dA = Math.abs(center2.getEstimatedModuleSize() - average);
            const dB = Math.abs(center1.getEstimatedModuleSize() - average);
            return dA < dB ? 1 : dA > dB ? -1 : 0;
          } else {
            return center2.getCount() - center1.getCount();
          }
        }
      );
      possibleCenters.splice(3);
    }
    return [
      possibleCenters[0],
      possibleCenters[1],
      possibleCenters[2]
    ];
  }
}

exports.FinderPatternFinder = FinderPatternFinder;
//# sourceMappingURL=FinderPatternFinder.cjs.map
//# sourceMappingURL=FinderPatternFinder.cjs.map