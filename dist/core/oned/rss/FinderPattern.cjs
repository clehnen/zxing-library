'use strict';

var ResultPoint = require('../../ResultPoint');

class FinderPattern {
  value;
  startEnd;
  resultPoints;
  constructor(value, startEnd, start, end, rowNumber) {
    this.value = value;
    this.startEnd = startEnd;
    this.resultPoints = new Array();
    this.resultPoints.push(new ResultPoint.ResultPoint(start, rowNumber));
    this.resultPoints.push(new ResultPoint.ResultPoint(end, rowNumber));
  }
  getValue() {
    return this.value;
  }
  getStartEnd() {
    return this.startEnd;
  }
  getResultPoints() {
    return this.resultPoints;
  }
  equals(o) {
    if (!(o instanceof FinderPattern)) {
      return false;
    }
    const that = o;
    return this.value === that.value;
  }
  hashCode() {
    return this.value;
  }
}

exports.FinderPattern = FinderPattern;
//# sourceMappingURL=FinderPattern.cjs.map
//# sourceMappingURL=FinderPattern.cjs.map