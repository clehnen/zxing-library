'use strict';

var ResultPoint = require('../../ResultPoint');
var MathUtils = require('./MathUtils');
var NotFoundException = require('../../NotFoundException');

class WhiteRectangleDetector {
  /*int*/
  // public constructor(private image: BitMatrix) /*throws NotFoundException*/ {
  //   this(image, INIT_SIZE, image.getWidth() / 2, image.getHeight() / 2)
  // }
  /**
   * @param image barcode image to find a rectangle in
   * @param initSize initial size of search area around center
   * @param x x position of search center
   * @param y y position of search center
   * @throws NotFoundException if image is too small to accommodate {@code initSize}
   */
  constructor(image, initSize, x, y) {
    this.image = image;
    this.height = image.getHeight();
    this.width = image.getWidth();
    if (void 0 === initSize || null === initSize) {
      initSize = WhiteRectangleDetector.INIT_SIZE;
    }
    if (void 0 === x || null === x) {
      x = image.getWidth() / 2 | 0;
    }
    if (void 0 === y || null === y) {
      y = image.getHeight() / 2 | 0;
    }
    const halfsize = initSize / 2 | 0;
    this.leftInit = x - halfsize;
    this.rightInit = x + halfsize;
    this.upInit = y - halfsize;
    this.downInit = y + halfsize;
    if (this.upInit < 0 || this.leftInit < 0 || this.downInit >= this.height || this.rightInit >= this.width) {
      throw new NotFoundException.NotFoundException();
    }
  }
  image;
  static INIT_SIZE = 10;
  static CORR = 1;
  height;
  /*int*/
  width;
  /*int*/
  leftInit;
  /*int*/
  rightInit;
  /*int*/
  downInit;
  /*int*/
  upInit;
  /**
   * <p>
   * Detects a candidate barcode-like rectangular region within an image. It
   * starts around the center of the image, increases the size of the candidate
   * region until it finds a white rectangular region.
   * </p>
   *
   * @return {@link ResultPoint}[] describing the corners of the rectangular
   *         region. The first and last points are opposed on the diagonal, as
   *         are the second and third. The first point will be the topmost
   *         point and the last, the bottommost. The second point will be
   *         leftmost and the third, the rightmost
   * @throws NotFoundException if no Data Matrix Code can be found
   */
  detect() {
    let left = this.leftInit;
    let right = this.rightInit;
    let up = this.upInit;
    let down = this.downInit;
    let sizeExceeded = false;
    let aBlackPointFoundOnBorder = true;
    let atLeastOneBlackPointFoundOnBorder = false;
    let atLeastOneBlackPointFoundOnRight = false;
    let atLeastOneBlackPointFoundOnBottom = false;
    let atLeastOneBlackPointFoundOnLeft = false;
    let atLeastOneBlackPointFoundOnTop = false;
    const width = this.width;
    const height = this.height;
    while (aBlackPointFoundOnBorder) {
      aBlackPointFoundOnBorder = false;
      let rightBorderNotWhite = true;
      while ((rightBorderNotWhite || !atLeastOneBlackPointFoundOnRight) && right < width) {
        rightBorderNotWhite = this.containsBlackPoint(up, down, right, false);
        if (rightBorderNotWhite) {
          right++;
          aBlackPointFoundOnBorder = true;
          atLeastOneBlackPointFoundOnRight = true;
        } else if (!atLeastOneBlackPointFoundOnRight) {
          right++;
        }
      }
      if (right >= width) {
        sizeExceeded = true;
        break;
      }
      let bottomBorderNotWhite = true;
      while ((bottomBorderNotWhite || !atLeastOneBlackPointFoundOnBottom) && down < height) {
        bottomBorderNotWhite = this.containsBlackPoint(left, right, down, true);
        if (bottomBorderNotWhite) {
          down++;
          aBlackPointFoundOnBorder = true;
          atLeastOneBlackPointFoundOnBottom = true;
        } else if (!atLeastOneBlackPointFoundOnBottom) {
          down++;
        }
      }
      if (down >= height) {
        sizeExceeded = true;
        break;
      }
      let leftBorderNotWhite = true;
      while ((leftBorderNotWhite || !atLeastOneBlackPointFoundOnLeft) && left >= 0) {
        leftBorderNotWhite = this.containsBlackPoint(up, down, left, false);
        if (leftBorderNotWhite) {
          left--;
          aBlackPointFoundOnBorder = true;
          atLeastOneBlackPointFoundOnLeft = true;
        } else if (!atLeastOneBlackPointFoundOnLeft) {
          left--;
        }
      }
      if (left < 0) {
        sizeExceeded = true;
        break;
      }
      let topBorderNotWhite = true;
      while ((topBorderNotWhite || !atLeastOneBlackPointFoundOnTop) && up >= 0) {
        topBorderNotWhite = this.containsBlackPoint(left, right, up, true);
        if (topBorderNotWhite) {
          up--;
          aBlackPointFoundOnBorder = true;
          atLeastOneBlackPointFoundOnTop = true;
        } else if (!atLeastOneBlackPointFoundOnTop) {
          up--;
        }
      }
      if (up < 0) {
        sizeExceeded = true;
        break;
      }
      if (aBlackPointFoundOnBorder) {
        atLeastOneBlackPointFoundOnBorder = true;
      }
    }
    if (!sizeExceeded && atLeastOneBlackPointFoundOnBorder) {
      const maxSize = right - left;
      let z = null;
      for (let i = 1; z === null && i < maxSize; i++) {
        z = this.getBlackPointOnSegment(left, down - i, left + i, down);
      }
      if (z == null) {
        throw new NotFoundException.NotFoundException();
      }
      let t = null;
      for (let i = 1; t === null && i < maxSize; i++) {
        t = this.getBlackPointOnSegment(left, up + i, left + i, up);
      }
      if (t == null) {
        throw new NotFoundException.NotFoundException();
      }
      let x = null;
      for (let i = 1; x === null && i < maxSize; i++) {
        x = this.getBlackPointOnSegment(right, up + i, right - i, up);
      }
      if (x == null) {
        throw new NotFoundException.NotFoundException();
      }
      let y = null;
      for (let i = 1; y === null && i < maxSize; i++) {
        y = this.getBlackPointOnSegment(right, down - i, right - i, down);
      }
      if (y == null) {
        throw new NotFoundException.NotFoundException();
      }
      return this.centerEdges(y, z, x, t);
    } else {
      throw new NotFoundException.NotFoundException();
    }
  }
  getBlackPointOnSegment(aX, aY, bX, bY) {
    const dist = MathUtils.MathUtils.round(MathUtils.MathUtils.distance(aX, aY, bX, bY));
    const xStep = (bX - aX) / dist;
    const yStep = (bY - aY) / dist;
    const image = this.image;
    for (let i = 0; i < dist; i++) {
      const x = MathUtils.MathUtils.round(aX + i * xStep);
      const y = MathUtils.MathUtils.round(aY + i * yStep);
      if (image.get(x, y)) {
        return new ResultPoint.ResultPoint(x, y);
      }
    }
    return null;
  }
  /**
   * recenters the points of a constant distance towards the center
   *
   * @param y bottom most point
   * @param z left most point
   * @param x right most point
   * @param t top most point
   * @return {@link ResultPoint}[] describing the corners of the rectangular
   *         region. The first and last points are opposed on the diagonal, as
   *         are the second and third. The first point will be the topmost
   *         point and the last, the bottommost. The second point will be
   *         leftmost and the third, the rightmost
   */
  centerEdges(y, z, x, t) {
    const yi = y.getX();
    const yj = y.getY();
    const zi = z.getX();
    const zj = z.getY();
    const xi = x.getX();
    const xj = x.getY();
    const ti = t.getX();
    const tj = t.getY();
    const CORR = WhiteRectangleDetector.CORR;
    if (yi < this.width / 2) {
      return [
        new ResultPoint.ResultPoint(ti - CORR, tj + CORR),
        new ResultPoint.ResultPoint(zi + CORR, zj + CORR),
        new ResultPoint.ResultPoint(xi - CORR, xj - CORR),
        new ResultPoint.ResultPoint(yi + CORR, yj - CORR)
      ];
    } else {
      return [
        new ResultPoint.ResultPoint(ti + CORR, tj + CORR),
        new ResultPoint.ResultPoint(zi + CORR, zj - CORR),
        new ResultPoint.ResultPoint(xi - CORR, xj + CORR),
        new ResultPoint.ResultPoint(yi - CORR, yj - CORR)
      ];
    }
  }
  /**
   * Determines whether a segment contains a black point
   *
   * @param a          min value of the scanned coordinate
   * @param b          max value of the scanned coordinate
   * @param fixed      value of fixed coordinate
   * @param horizontal set to true if scan must be horizontal, false if vertical
   * @return true if a black point has been found, else false.
   */
  containsBlackPoint(a, b, fixed, horizontal) {
    const image = this.image;
    if (horizontal) {
      for (let x = a; x <= b; x++) {
        if (image.get(x, fixed)) {
          return true;
        }
      }
    } else {
      for (let y = a; y <= b; y++) {
        if (image.get(fixed, y)) {
          return true;
        }
      }
    }
    return false;
  }
}

exports.WhiteRectangleDetector = WhiteRectangleDetector;
//# sourceMappingURL=WhiteRectangleDetector.cjs.map
//# sourceMappingURL=WhiteRectangleDetector.cjs.map