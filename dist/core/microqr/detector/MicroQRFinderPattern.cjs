'use strict';

var ResultPoint = require('../../ResultPoint');

class MicroQRFinderPattern extends ResultPoint.ResultPoint {
  constructor(posX, posY, estimatedModuleSize, count = 1) {
    super(posX, posY);
    this.estimatedModuleSize = estimatedModuleSize;
    this.count = count;
  }
  estimatedModuleSize;
  count;
  getEstimatedModuleSize() {
    return this.estimatedModuleSize;
  }
  getCount() {
    return this.count;
  }
  /**
   * Returns true if this pattern is approximately at position (i, j)
   * with the given module size.
   */
  aboutEquals(moduleSize, i, j) {
    if (Math.abs(i - this.getY()) <= moduleSize && Math.abs(j - this.getX()) <= moduleSize) {
      const moduleSizeDiff = Math.abs(moduleSize - this.estimatedModuleSize);
      return moduleSizeDiff <= 1 || moduleSizeDiff <= this.estimatedModuleSize;
    }
    return false;
  }
  /**
   * Return a new pattern that is a weighted average of this pattern and a new estimate.
   */
  combineEstimate(i, j, newModuleSize) {
    const combinedCount = this.count + 1;
    const combinedX = (this.count * this.getX() + j) / combinedCount;
    const combinedY = (this.count * this.getY() + i) / combinedCount;
    const combinedModuleSize = (this.count * this.estimatedModuleSize + newModuleSize) / combinedCount;
    return new MicroQRFinderPattern(combinedX, combinedY, combinedModuleSize, combinedCount);
  }
}

exports.MicroQRFinderPattern = MicroQRFinderPattern;
//# sourceMappingURL=MicroQRFinderPattern.cjs.map
//# sourceMappingURL=MicroQRFinderPattern.cjs.map