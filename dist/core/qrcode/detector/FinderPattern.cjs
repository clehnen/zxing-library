'use strict';

var ResultPoint = require('../../ResultPoint');

class FinderPattern extends ResultPoint.ResultPoint {
  // FinderPattern(posX: number/*float*/, posY: number/*float*/, estimatedModuleSize: number/*float*/) {
  //   this(posX, posY, estimatedModuleSize, 1)
  // }
  constructor(posX, posY, estimatedModuleSize, count) {
    super(posX, posY);
    this.estimatedModuleSize = estimatedModuleSize;
    this.count = count;
    if (void 0 === count) {
      this.count = 1;
    }
  }
  estimatedModuleSize;
  count;
  getEstimatedModuleSize() {
    return this.estimatedModuleSize;
  }
  getCount() {
    return this.count;
  }
  /*
  void incrementCount() {
    this.count++
  }
   */
  /**
   * <p>Determines if this finder pattern "about equals" a finder pattern at the stated
   * position and size -- meaning, it is at nearly the same center with nearly the same size.</p>
   */
  aboutEquals(moduleSize, i, j) {
    if (Math.abs(i - this.getY()) <= moduleSize && Math.abs(j - this.getX()) <= moduleSize) {
      const moduleSizeDiff = Math.abs(moduleSize - this.estimatedModuleSize);
      return moduleSizeDiff <= 1 || moduleSizeDiff <= this.estimatedModuleSize;
    }
    return false;
  }
  /**
   * Combines this object's current estimate of a finder pattern position and module size
   * with a new estimate. It returns a new {@code FinderPattern} containing a weighted average
   * based on count.
   */
  combineEstimate(i, j, newModuleSize) {
    const combinedCount = this.count + 1;
    const combinedX = (this.count * this.getX() + j) / combinedCount;
    const combinedY = (this.count * this.getY() + i) / combinedCount;
    const combinedModuleSize = (this.count * this.estimatedModuleSize + newModuleSize) / combinedCount;
    return new FinderPattern(combinedX, combinedY, combinedModuleSize, combinedCount);
  }
}

exports.FinderPattern = FinderPattern;
//# sourceMappingURL=FinderPattern.cjs.map
//# sourceMappingURL=FinderPattern.cjs.map