import { AlignmentPattern } from './AlignmentPattern';
import { NotFoundException } from '../../NotFoundException';

class AlignmentPatternFinder {
  /**
   * <p>Creates a finder that will look in a portion of the whole image.</p>
   *
   * @param image image to search
   * @param startX left column from which to start searching
   * @param startY top row from which to start searching
   * @param width width of region to search
   * @param height height of region to search
   * @param moduleSize estimated module size so far
   */
  constructor(image, startX, startY, width, height, moduleSize, resultPointCallback) {
    this.image = image;
    this.startX = startX;
    this.startY = startY;
    this.width = width;
    this.height = height;
    this.moduleSize = moduleSize;
    this.resultPointCallback = resultPointCallback;
    this.possibleCenters = [];
    this.crossCheckStateCount = new Int32Array(3);
  }
  image;
  startX;
  startY;
  width;
  height;
  moduleSize;
  resultPointCallback;
  possibleCenters;
  crossCheckStateCount;
  /**
   * <p>This method attempts to find the bottom-right alignment pattern in the image. It is a bit messy since
   * it's pretty performance-critical and so is written to be fast foremost.</p>
   *
   * @return {@link AlignmentPattern} if found
   * @throws NotFoundException if not found
   */
  find() {
    const startX = this.startX;
    const height = this.height;
    const width = this.width;
    const maxJ = startX + width;
    const middleI = this.startY + height / 2;
    const stateCount = new Int32Array(3);
    const image = this.image;
    for (let iGen = 0; iGen < height; iGen++) {
      const i = middleI + ((iGen & 1) === 0 ? Math.floor((iGen + 1) / 2) : -Math.floor((iGen + 1) / 2));
      stateCount[0] = 0;
      stateCount[1] = 0;
      stateCount[2] = 0;
      let j = startX;
      while (j < maxJ && !image.get(j, i)) {
        j++;
      }
      let currentState = 0;
      while (j < maxJ) {
        if (image.get(j, i)) {
          if (currentState === 1) {
            stateCount[1]++;
          } else {
            if (currentState === 2) {
              if (this.foundPatternCross(stateCount)) {
                const confirmed = this.handlePossibleCenter(stateCount, i, j);
                if (confirmed !== null) {
                  return confirmed;
                }
              }
              stateCount[0] = stateCount[2];
              stateCount[1] = 1;
              stateCount[2] = 0;
              currentState = 1;
            } else {
              stateCount[++currentState]++;
            }
          }
        } else {
          if (currentState === 1) {
            currentState++;
          }
          stateCount[currentState]++;
        }
        j++;
      }
      if (this.foundPatternCross(stateCount)) {
        const confirmed = this.handlePossibleCenter(stateCount, i, maxJ);
        if (confirmed !== null) {
          return confirmed;
        }
      }
    }
    if (this.possibleCenters.length !== 0) {
      return this.possibleCenters[0];
    }
    throw new NotFoundException();
  }
  /**
   * Given a count of black/white/black pixels just seen and an end position,
   * figures the location of the center of this black/white/black run.
   */
  static centerFromEnd(stateCount, end) {
    return end - stateCount[2] - stateCount[1] / 2;
  }
  /**
   * @param stateCount count of black/white/black pixels just read
   * @return true iff the proportions of the counts is close enough to the 1/1/1 ratios
   *         used by alignment patterns to be considered a match
   */
  foundPatternCross(stateCount) {
    const moduleSize = this.moduleSize;
    const maxVariance = moduleSize / 2;
    for (let i = 0; i < 3; i++) {
      if (Math.abs(moduleSize - stateCount[i]) >= maxVariance) {
        return false;
      }
    }
    return true;
  }
  /**
   * <p>After a horizontal scan finds a potential alignment pattern, this method
   * "cross-checks" by scanning down vertically through the center of the possible
   * alignment pattern to see if the same proportion is detected.</p>
   *
   * @param startI row where an alignment pattern was detected
   * @param centerJ center of the section that appears to cross an alignment pattern
   * @param maxCount maximum reasonable number of modules that should be
   * observed in any reading state, based on the results of the horizontal scan
   * @return vertical center of alignment pattern, or {@link Float#NaN} if not found
   */
  crossCheckVertical(startI, centerJ, maxCount, originalStateCountTotal) {
    const image = this.image;
    const maxI = image.getHeight();
    const stateCount = this.crossCheckStateCount;
    stateCount[0] = 0;
    stateCount[1] = 0;
    stateCount[2] = 0;
    let i = startI;
    while (i >= 0 && image.get(centerJ, i) && stateCount[1] <= maxCount) {
      stateCount[1]++;
      i--;
    }
    if (i < 0 || stateCount[1] > maxCount) {
      return NaN;
    }
    while (i >= 0 && !image.get(centerJ, i) && stateCount[0] <= maxCount) {
      stateCount[0]++;
      i--;
    }
    if (stateCount[0] > maxCount) {
      return NaN;
    }
    i = startI + 1;
    while (i < maxI && image.get(centerJ, i) && stateCount[1] <= maxCount) {
      stateCount[1]++;
      i++;
    }
    if (i === maxI || stateCount[1] > maxCount) {
      return NaN;
    }
    while (i < maxI && !image.get(centerJ, i) && stateCount[2] <= maxCount) {
      stateCount[2]++;
      i++;
    }
    if (stateCount[2] > maxCount) {
      return NaN;
    }
    const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];
    if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) {
      return NaN;
    }
    return this.foundPatternCross(stateCount) ? AlignmentPatternFinder.centerFromEnd(stateCount, i) : NaN;
  }
  /**
   * <p>This is called when a horizontal scan finds a possible alignment pattern. It will
   * cross check with a vertical scan, and if successful, will see if this pattern had been
   * found on a previous horizontal scan. If so, we consider it confirmed and conclude we have
   * found the alignment pattern.</p>
   *
   * @param stateCount reading state module counts from horizontal scan
   * @param i row where alignment pattern may be found
   * @param j end of possible alignment pattern in row
   * @return {@link AlignmentPattern} if we have found the same pattern twice, or null if not
   */
  handlePossibleCenter(stateCount, i, j) {
    const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];
    const centerJ = AlignmentPatternFinder.centerFromEnd(stateCount, j);
    const centerI = this.crossCheckVertical(
      i,
      /*(int) */
      centerJ,
      2 * stateCount[1],
      stateCountTotal
    );
    if (!isNaN(centerI)) {
      const estimatedModuleSize = (stateCount[0] + stateCount[1] + stateCount[2]) / 3;
      for (const center of this.possibleCenters) {
        if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
          return center.combineEstimate(centerI, centerJ, estimatedModuleSize);
        }
      }
      const point = new AlignmentPattern(centerJ, centerI, estimatedModuleSize);
      this.possibleCenters.push(point);
      if (this.resultPointCallback !== null && this.resultPointCallback !== void 0) {
        this.resultPointCallback.foundPossibleResultPoint(point);
      }
    }
    return null;
  }
}

export { AlignmentPatternFinder };
//# sourceMappingURL=AlignmentPatternFinder.js.map
//# sourceMappingURL=AlignmentPatternFinder.js.map