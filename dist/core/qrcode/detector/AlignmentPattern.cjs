'use strict';

var ResultPoint = require('../../ResultPoint');

class AlignmentPattern extends ResultPoint.ResultPoint {
  constructor(posX, posY, estimatedModuleSize) {
    super(posX, posY);
    this.estimatedModuleSize = estimatedModuleSize;
  }
  estimatedModuleSize;
  /**
   * <p>Determines if this alignment pattern "about equals" an alignment pattern at the stated
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
   * with a new estimate. It returns a new {@code FinderPattern} containing an average of the two.
   */
  combineEstimate(i, j, newModuleSize) {
    const combinedX = (this.getX() + j) / 2;
    const combinedY = (this.getY() + i) / 2;
    const combinedModuleSize = (this.estimatedModuleSize + newModuleSize) / 2;
    return new AlignmentPattern(combinedX, combinedY, combinedModuleSize);
  }
}

exports.AlignmentPattern = AlignmentPattern;
//# sourceMappingURL=AlignmentPattern.cjs.map
//# sourceMappingURL=AlignmentPattern.cjs.map