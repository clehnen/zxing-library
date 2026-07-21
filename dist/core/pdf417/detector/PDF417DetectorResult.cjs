'use strict';

class PDF417DetectorResult {
  bits;
  points;
  constructor(bits, points) {
    this.bits = bits;
    this.points = points;
  }
  getBits() {
    return this.bits;
  }
  getPoints() {
    return this.points;
  }
}

exports.PDF417DetectorResult = PDF417DetectorResult;
//# sourceMappingURL=PDF417DetectorResult.cjs.map
//# sourceMappingURL=PDF417DetectorResult.cjs.map