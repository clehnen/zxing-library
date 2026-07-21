'use strict';

class FinderPatternInfo {
  bottomLeft;
  topLeft;
  topRight;
  constructor(patternCenters) {
    this.bottomLeft = patternCenters[0];
    this.topLeft = patternCenters[1];
    this.topRight = patternCenters[2];
  }
  getBottomLeft() {
    return this.bottomLeft;
  }
  getTopLeft() {
    return this.topLeft;
  }
  getTopRight() {
    return this.topRight;
  }
}

exports.FinderPatternInfo = FinderPatternInfo;
//# sourceMappingURL=FinderPatternInfo.cjs.map
//# sourceMappingURL=FinderPatternInfo.cjs.map