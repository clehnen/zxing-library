'use strict';

var MathUtils = require('./common/detector/MathUtils');
var Float = require('./util/Float');

class ResultPoint {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  x;
  y;
  getX() {
    return this.x;
  }
  getY() {
    return this.y;
  }
  /*@Override*/
  equals(other) {
    if (other instanceof ResultPoint) {
      const otherPoint = other;
      return this.x === otherPoint.x && this.y === otherPoint.y;
    }
    return false;
  }
  /*@Override*/
  hashCode() {
    return 31 * Float.Float.floatToIntBits(this.x) + Float.Float.floatToIntBits(this.y);
  }
  /*@Override*/
  toString() {
    return "(" + this.x + "," + this.y + ")";
  }
  /**
   * Orders an array of three ResultPoints in an order [A,B,C] such that AB is less than AC
   * and BC is less than AC, and the angle between BC and BA is less than 180 degrees.
   *
   * @param patterns array of three {@code ResultPoint} to order
   */
  static orderBestPatterns(patterns) {
    const zeroOneDistance = this.distance(patterns[0], patterns[1]);
    const oneTwoDistance = this.distance(patterns[1], patterns[2]);
    const zeroTwoDistance = this.distance(patterns[0], patterns[2]);
    let pointA;
    let pointB;
    let pointC;
    if (oneTwoDistance >= zeroOneDistance && oneTwoDistance >= zeroTwoDistance) {
      pointB = patterns[0];
      pointA = patterns[1];
      pointC = patterns[2];
    } else if (zeroTwoDistance >= oneTwoDistance && zeroTwoDistance >= zeroOneDistance) {
      pointB = patterns[1];
      pointA = patterns[0];
      pointC = patterns[2];
    } else {
      pointB = patterns[2];
      pointA = patterns[0];
      pointC = patterns[1];
    }
    if (this.crossProductZ(pointA, pointB, pointC) < 0) {
      const temp = pointA;
      pointA = pointC;
      pointC = temp;
    }
    patterns[0] = pointA;
    patterns[1] = pointB;
    patterns[2] = pointC;
  }
  /**
   * @param pattern1 first pattern
   * @param pattern2 second pattern
   * @return distance between two points
   */
  static distance(pattern1, pattern2) {
    return MathUtils.MathUtils.distance(pattern1.x, pattern1.y, pattern2.x, pattern2.y);
  }
  /**
   * Returns the z component of the cross product between vectors BC and BA.
   */
  static crossProductZ(pointA, pointB, pointC) {
    const bX = pointB.x;
    const bY = pointB.y;
    return (pointC.x - bX) * (pointA.y - bY) - (pointC.y - bY) * (pointA.x - bX);
  }
}

exports.ResultPoint = ResultPoint;
//# sourceMappingURL=ResultPoint.cjs.map
//# sourceMappingURL=ResultPoint.cjs.map