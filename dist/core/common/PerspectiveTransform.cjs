'use strict';

class PerspectiveTransform {
  constructor(a11, a21, a31, a12, a22, a32, a13, a23, a33) {
    this.a11 = a11;
    this.a21 = a21;
    this.a31 = a31;
    this.a12 = a12;
    this.a22 = a22;
    this.a32 = a32;
    this.a13 = a13;
    this.a23 = a23;
    this.a33 = a33;
  }
  a11;
  a21;
  a31;
  a12;
  a22;
  a32;
  a13;
  a23;
  a33;
  static quadrilateralToQuadrilateral(x0, y0, x1, y1, x2, y2, x3, y3, x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p) {
    const qToS = PerspectiveTransform.quadrilateralToSquare(x0, y0, x1, y1, x2, y2, x3, y3);
    const sToQ = PerspectiveTransform.squareToQuadrilateral(x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p);
    return sToQ.times(qToS);
  }
  transformPoints(points) {
    const max = points.length;
    const a11 = this.a11;
    const a12 = this.a12;
    const a13 = this.a13;
    const a21 = this.a21;
    const a22 = this.a22;
    const a23 = this.a23;
    const a31 = this.a31;
    const a32 = this.a32;
    const a33 = this.a33;
    for (let i = 0; i < max; i += 2) {
      const x = points[i];
      const y = points[i + 1];
      const denominator = a13 * x + a23 * y + a33;
      points[i] = (a11 * x + a21 * y + a31) / denominator;
      points[i + 1] = (a12 * x + a22 * y + a32) / denominator;
    }
  }
  transformPointsWithValues(xValues, yValues) {
    const a11 = this.a11;
    const a12 = this.a12;
    const a13 = this.a13;
    const a21 = this.a21;
    const a22 = this.a22;
    const a23 = this.a23;
    const a31 = this.a31;
    const a32 = this.a32;
    const a33 = this.a33;
    const n = xValues.length;
    for (let i = 0; i < n; i++) {
      const x = xValues[i];
      const y = yValues[i];
      const denominator = a13 * x + a23 * y + a33;
      xValues[i] = (a11 * x + a21 * y + a31) / denominator;
      yValues[i] = (a12 * x + a22 * y + a32) / denominator;
    }
  }
  static squareToQuadrilateral(x0, y0, x1, y1, x2, y2, x3, y3) {
    const dx3 = x0 - x1 + x2 - x3;
    const dy3 = y0 - y1 + y2 - y3;
    if (dx3 === 0 && dy3 === 0) {
      return new PerspectiveTransform(
        x1 - x0,
        x2 - x1,
        x0,
        y1 - y0,
        y2 - y1,
        y0,
        0,
        0,
        1
      );
    } else {
      const dx1 = x1 - x2;
      const dx2 = x3 - x2;
      const dy1 = y1 - y2;
      const dy2 = y3 - y2;
      const denominator = dx1 * dy2 - dx2 * dy1;
      const a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
      const a23 = (dx1 * dy3 - dx3 * dy1) / denominator;
      return new PerspectiveTransform(
        x1 - x0 + a13 * x1,
        x3 - x0 + a23 * x3,
        x0,
        y1 - y0 + a13 * y1,
        y3 - y0 + a23 * y3,
        y0,
        a13,
        a23,
        1
      );
    }
  }
  static quadrilateralToSquare(x0, y0, x1, y1, x2, y2, x3, y3) {
    return PerspectiveTransform.squareToQuadrilateral(x0, y0, x1, y1, x2, y2, x3, y3).buildAdjoint();
  }
  buildAdjoint() {
    return new PerspectiveTransform(
      this.a22 * this.a33 - this.a23 * this.a32,
      this.a23 * this.a31 - this.a21 * this.a33,
      this.a21 * this.a32 - this.a22 * this.a31,
      this.a13 * this.a32 - this.a12 * this.a33,
      this.a11 * this.a33 - this.a13 * this.a31,
      this.a12 * this.a31 - this.a11 * this.a32,
      this.a12 * this.a23 - this.a13 * this.a22,
      this.a13 * this.a21 - this.a11 * this.a23,
      this.a11 * this.a22 - this.a12 * this.a21
    );
  }
  times(other) {
    return new PerspectiveTransform(
      this.a11 * other.a11 + this.a21 * other.a12 + this.a31 * other.a13,
      this.a11 * other.a21 + this.a21 * other.a22 + this.a31 * other.a23,
      this.a11 * other.a31 + this.a21 * other.a32 + this.a31 * other.a33,
      this.a12 * other.a11 + this.a22 * other.a12 + this.a32 * other.a13,
      this.a12 * other.a21 + this.a22 * other.a22 + this.a32 * other.a23,
      this.a12 * other.a31 + this.a22 * other.a32 + this.a32 * other.a33,
      this.a13 * other.a11 + this.a23 * other.a12 + this.a33 * other.a13,
      this.a13 * other.a21 + this.a23 * other.a22 + this.a33 * other.a23,
      this.a13 * other.a31 + this.a23 * other.a32 + this.a33 * other.a33
    );
  }
}

exports.PerspectiveTransform = PerspectiveTransform;
//# sourceMappingURL=PerspectiveTransform.cjs.map
//# sourceMappingURL=PerspectiveTransform.cjs.map