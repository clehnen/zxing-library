'use strict';

var ResultPoint = require('../../ResultPoint');
var AztecDetectorResult = require('../AztecDetectorResult');
var MathUtils = require('../../common/detector/MathUtils');
var WhiteRectangleDetector = require('../../common/detector/WhiteRectangleDetector');
var GenericGF = require('../../common/reedsolomon/GenericGF');
var ReedSolomonDecoder = require('../../common/reedsolomon/ReedSolomonDecoder');
var NotFoundException = require('../../NotFoundException');
var GridSamplerInstance = require('../../common/GridSamplerInstance');
var ZXingInteger = require('../../util/ZXingInteger');

class AztecPoint {
  x;
  y;
  toResultPoint() {
    return new ResultPoint.ResultPoint(this.getX(), this.getY());
  }
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  getX() {
    return this.x;
  }
  getY() {
    return this.y;
  }
  // @Override
  // public String toString() {
  //     return "<" + x + ' ' + y + '>';
  // }
}
class AztecDetector {
  EXPECTED_CORNER_BITS = new Int32Array([
    3808,
    // 07340  XXX .XX X.. ...
    476,
    // 00734  ... XXX .XX X..
    2107,
    // 04073  X.. ... XXX .XX
    1799
    // 03407 .XX X.. ... XXX
  ]);
  image;
  compact;
  nbLayers;
  nbDataBlocks;
  nbCenterLayers;
  shift;
  constructor(image) {
    this.image = image;
  }
  detect() {
    return this.detectMirror(false);
  }
  /**
   * Detects an Aztec Code in an image.
   *
   * @param isMirror if true, image is a mirror-image of original
   * @return {@link AztecDetectorResult} encapsulating results of detecting an Aztec Code
   * @throws NotFoundException if no Aztec Code can be found
   */
  detectMirror(isMirror) {
    let pCenter = this.getMatrixCenter();
    let bullsEyeCorners = this.getBullsEyeCorners(pCenter);
    if (isMirror) {
      let temp = bullsEyeCorners[0];
      bullsEyeCorners[0] = bullsEyeCorners[2];
      bullsEyeCorners[2] = temp;
    }
    this.extractParameters(bullsEyeCorners);
    let bits = this.sampleGrid(
      this.image,
      bullsEyeCorners[this.shift % 4],
      bullsEyeCorners[(this.shift + 1) % 4],
      bullsEyeCorners[(this.shift + 2) % 4],
      bullsEyeCorners[(this.shift + 3) % 4]
    );
    let corners = this.getMatrixCornerPoints(bullsEyeCorners);
    return new AztecDetectorResult.AztecDetectorResult(bits, corners, this.compact, this.nbDataBlocks, this.nbLayers);
  }
  /**
   * Extracts the number of data layers and data blocks from the layer around the bull's eye.
   *
   * @param bullsEyeCorners the array of bull's eye corners
   * @throws NotFoundException in case of too many errors or invalid parameters
   */
  extractParameters(bullsEyeCorners) {
    if (!this.isValidPoint(bullsEyeCorners[0]) || !this.isValidPoint(bullsEyeCorners[1]) || !this.isValidPoint(bullsEyeCorners[2]) || !this.isValidPoint(bullsEyeCorners[3])) {
      throw new NotFoundException.NotFoundException();
    }
    let length = 2 * this.nbCenterLayers;
    let sides = new Int32Array([
      this.sampleLine(bullsEyeCorners[0], bullsEyeCorners[1], length),
      // Right side
      this.sampleLine(bullsEyeCorners[1], bullsEyeCorners[2], length),
      // Bottom
      this.sampleLine(bullsEyeCorners[2], bullsEyeCorners[3], length),
      // Left side
      this.sampleLine(bullsEyeCorners[3], bullsEyeCorners[0], length)
      // Top
    ]);
    this.shift = this.getRotation(sides, length);
    let parameterData = 0;
    for (let i = 0; i < 4; i++) {
      let side = sides[(this.shift + i) % 4];
      if (this.compact) {
        parameterData <<= 7;
        parameterData += side >> 1 & 127;
      } else {
        parameterData <<= 10;
        parameterData += (side >> 2 & 31 << 5) + (side >> 1 & 31);
      }
    }
    let correctedData = this.getCorrectedParameterData(parameterData, this.compact);
    if (this.compact) {
      this.nbLayers = (correctedData >> 6) + 1;
      this.nbDataBlocks = (correctedData & 63) + 1;
    } else {
      this.nbLayers = (correctedData >> 11) + 1;
      this.nbDataBlocks = (correctedData & 2047) + 1;
    }
  }
  getRotation(sides, length) {
    let cornerBits = 0;
    sides.forEach((side, idx, arr) => {
      let t = (side >> length - 2 << 1) + (side & 1);
      cornerBits = (cornerBits << 3) + t;
    });
    cornerBits = ((cornerBits & 1) << 11) + (cornerBits >> 1);
    for (let shift = 0; shift < 4; shift++) {
      if (ZXingInteger.ZXingInteger.bitCount(cornerBits ^ this.EXPECTED_CORNER_BITS[shift]) <= 2) {
        return shift;
      }
    }
    throw new NotFoundException.NotFoundException();
  }
  /**
   * Corrects the parameter bits using Reed-Solomon algorithm.
   *
   * @param parameterData parameter bits
   * @param compact true if this is a compact Aztec code
   * @throws NotFoundException if the array contains too many errors
   */
  getCorrectedParameterData(parameterData, compact) {
    let numCodewords;
    let numDataCodewords;
    if (compact) {
      numCodewords = 7;
      numDataCodewords = 2;
    } else {
      numCodewords = 10;
      numDataCodewords = 4;
    }
    let numECCodewords = numCodewords - numDataCodewords;
    let parameterWords = new Int32Array(numCodewords);
    for (let i = numCodewords - 1; i >= 0; --i) {
      parameterWords[i] = parameterData & 15;
      parameterData >>= 4;
    }
    try {
      let rsDecoder = new ReedSolomonDecoder.ReedSolomonDecoder(GenericGF.GenericGF.AZTEC_PARAM);
      rsDecoder.decode(parameterWords, numECCodewords);
    } catch (ignored) {
      throw new NotFoundException.NotFoundException();
    }
    let result = 0;
    for (let i = 0; i < numDataCodewords; i++) {
      result = (result << 4) + parameterWords[i];
    }
    return result;
  }
  /**
   * Finds the corners of a bull-eye centered on the passed point.
   * This returns the centers of the diagonal points just outside the bull's eye
   * Returns [topRight, bottomRight, bottomLeft, topLeft]
   *
   * @param pCenter Center point
   * @return The corners of the bull-eye
   * @throws NotFoundException If no valid bull-eye can be found
   */
  getBullsEyeCorners(pCenter) {
    let pina = pCenter;
    let pinb = pCenter;
    let pinc = pCenter;
    let pind = pCenter;
    let color = true;
    for (this.nbCenterLayers = 1; this.nbCenterLayers < 9; this.nbCenterLayers++) {
      let pouta = this.getFirstDifferent(pina, color, 1, -1);
      let poutb = this.getFirstDifferent(pinb, color, 1, 1);
      let poutc = this.getFirstDifferent(pinc, color, -1, 1);
      let poutd = this.getFirstDifferent(pind, color, -1, -1);
      if (this.nbCenterLayers > 2) {
        let q = this.distancePoint(poutd, pouta) * this.nbCenterLayers / (this.distancePoint(pind, pina) * (this.nbCenterLayers + 2));
        if (q < 0.75 || q > 1.25 || !this.isWhiteOrBlackRectangle(pouta, poutb, poutc, poutd)) {
          break;
        }
      }
      pina = pouta;
      pinb = poutb;
      pinc = poutc;
      pind = poutd;
      color = !color;
    }
    if (this.nbCenterLayers !== 5 && this.nbCenterLayers !== 7) {
      throw new NotFoundException.NotFoundException();
    }
    this.compact = this.nbCenterLayers === 5;
    let pinax = new ResultPoint.ResultPoint(pina.getX() + 0.5, pina.getY() - 0.5);
    let pinbx = new ResultPoint.ResultPoint(pinb.getX() + 0.5, pinb.getY() + 0.5);
    let pincx = new ResultPoint.ResultPoint(pinc.getX() - 0.5, pinc.getY() + 0.5);
    let pindx = new ResultPoint.ResultPoint(pind.getX() - 0.5, pind.getY() - 0.5);
    return this.expandSquare(
      [pinax, pinbx, pincx, pindx],
      2 * this.nbCenterLayers - 3,
      2 * this.nbCenterLayers
    );
  }
  /**
   * Finds a candidate center point of an Aztec code from an image
   *
   * @return the center point
   */
  getMatrixCenter() {
    let pointA;
    let pointB;
    let pointC;
    let pointD;
    try {
      let cornerPoints = new WhiteRectangleDetector.WhiteRectangleDetector(this.image).detect();
      pointA = cornerPoints[0];
      pointB = cornerPoints[1];
      pointC = cornerPoints[2];
      pointD = cornerPoints[3];
    } catch (e) {
      let cx2 = this.image.getWidth() / 2;
      let cy2 = this.image.getHeight() / 2;
      pointA = this.getFirstDifferent(new AztecPoint(cx2 + 7, cy2 - 7), false, 1, -1).toResultPoint();
      pointB = this.getFirstDifferent(new AztecPoint(cx2 + 7, cy2 + 7), false, 1, 1).toResultPoint();
      pointC = this.getFirstDifferent(new AztecPoint(cx2 - 7, cy2 + 7), false, -1, 1).toResultPoint();
      pointD = this.getFirstDifferent(new AztecPoint(cx2 - 7, cy2 - 7), false, -1, -1).toResultPoint();
    }
    let cx = MathUtils.MathUtils.round((pointA.getX() + pointD.getX() + pointB.getX() + pointC.getX()) / 4);
    let cy = MathUtils.MathUtils.round((pointA.getY() + pointD.getY() + pointB.getY() + pointC.getY()) / 4);
    try {
      let cornerPoints = new WhiteRectangleDetector.WhiteRectangleDetector(this.image, 15, cx, cy).detect();
      pointA = cornerPoints[0];
      pointB = cornerPoints[1];
      pointC = cornerPoints[2];
      pointD = cornerPoints[3];
    } catch (e) {
      pointA = this.getFirstDifferent(new AztecPoint(cx + 7, cy - 7), false, 1, -1).toResultPoint();
      pointB = this.getFirstDifferent(new AztecPoint(cx + 7, cy + 7), false, 1, 1).toResultPoint();
      pointC = this.getFirstDifferent(new AztecPoint(cx - 7, cy + 7), false, -1, 1).toResultPoint();
      pointD = this.getFirstDifferent(new AztecPoint(cx - 7, cy - 7), false, -1, -1).toResultPoint();
    }
    cx = MathUtils.MathUtils.round((pointA.getX() + pointD.getX() + pointB.getX() + pointC.getX()) / 4);
    cy = MathUtils.MathUtils.round((pointA.getY() + pointD.getY() + pointB.getY() + pointC.getY()) / 4);
    return new AztecPoint(cx, cy);
  }
  /**
   * Gets the Aztec code corners from the bull's eye corners and the parameters.
   *
   * @param bullsEyeCorners the array of bull's eye corners
   * @return the array of aztec code corners
   */
  getMatrixCornerPoints(bullsEyeCorners) {
    return this.expandSquare(bullsEyeCorners, 2 * this.nbCenterLayers, this.getDimension());
  }
  /**
   * Creates a BitMatrix by sampling the provided image.
   * topLeft, topRight, bottomRight, and bottomLeft are the centers of the squares on the
   * diagonal just outside the bull's eye.
   */
  sampleGrid(image, topLeft, topRight, bottomRight, bottomLeft) {
    let sampler = GridSamplerInstance.GridSamplerInstance.getInstance();
    let dimension = this.getDimension();
    let low = dimension / 2 - this.nbCenterLayers;
    let high = dimension / 2 + this.nbCenterLayers;
    return sampler.sampleGrid(
      image,
      dimension,
      dimension,
      low,
      low,
      // topleft
      high,
      low,
      // topright
      high,
      high,
      // bottomright
      low,
      high,
      // bottomleft
      topLeft.getX(),
      topLeft.getY(),
      topRight.getX(),
      topRight.getY(),
      bottomRight.getX(),
      bottomRight.getY(),
      bottomLeft.getX(),
      bottomLeft.getY()
    );
  }
  /**
   * Samples a line.
   *
   * @param p1   start point (inclusive)
   * @param p2   end point (exclusive)
   * @param size number of bits
   * @return the array of bits as an int (first bit is high-order bit of result)
   */
  sampleLine(p1, p2, size) {
    let result = 0;
    let d = this.distanceResultPoint(p1, p2);
    let moduleSize = d / size;
    let px = p1.getX();
    let py = p1.getY();
    let dx = moduleSize * (p2.getX() - p1.getX()) / d;
    let dy = moduleSize * (p2.getY() - p1.getY()) / d;
    for (let i = 0; i < size; i++) {
      if (this.image.get(MathUtils.MathUtils.round(px + i * dx), MathUtils.MathUtils.round(py + i * dy))) {
        result |= 1 << size - i - 1;
      }
    }
    return result;
  }
  /**
   * @return true if the border of the rectangle passed in parameter is compound of white points only
   *         or black points only
   */
  isWhiteOrBlackRectangle(p1, p2, p3, p4) {
    let corr = 3;
    p1 = new AztecPoint(p1.getX() - corr, p1.getY() + corr);
    p2 = new AztecPoint(p2.getX() - corr, p2.getY() - corr);
    p3 = new AztecPoint(p3.getX() + corr, p3.getY() - corr);
    p4 = new AztecPoint(p4.getX() + corr, p4.getY() + corr);
    let cInit = this.getColor(p4, p1);
    if (cInit === 0) {
      return false;
    }
    let c = this.getColor(p1, p2);
    if (c !== cInit) {
      return false;
    }
    c = this.getColor(p2, p3);
    if (c !== cInit) {
      return false;
    }
    c = this.getColor(p3, p4);
    return c === cInit;
  }
  /**
   * Gets the color of a segment
   *
   * @return 1 if segment more than 90% black, -1 if segment is more than 90% white, 0 else
   */
  getColor(p1, p2) {
    let d = this.distancePoint(p1, p2);
    let dx = (p2.getX() - p1.getX()) / d;
    let dy = (p2.getY() - p1.getY()) / d;
    let error = 0;
    let px = p1.getX();
    let py = p1.getY();
    let colorModel = this.image.get(p1.getX(), p1.getY());
    let iMax = Math.ceil(d);
    for (let i = 0; i < iMax; i++) {
      px += dx;
      py += dy;
      if (this.image.get(MathUtils.MathUtils.round(px), MathUtils.MathUtils.round(py)) !== colorModel) {
        error++;
      }
    }
    let errRatio = error / d;
    if (errRatio > 0.1 && errRatio < 0.9) {
      return 0;
    }
    return errRatio <= 0.1 === colorModel ? 1 : -1;
  }
  /**
   * Gets the coordinate of the first point with a different color in the given direction
   */
  getFirstDifferent(init, color, dx, dy) {
    let x = init.getX() + dx;
    let y = init.getY() + dy;
    while (this.isValid(x, y) && this.image.get(x, y) === color) {
      x += dx;
      y += dy;
    }
    x -= dx;
    y -= dy;
    while (this.isValid(x, y) && this.image.get(x, y) === color) {
      x += dx;
    }
    x -= dx;
    while (this.isValid(x, y) && this.image.get(x, y) === color) {
      y += dy;
    }
    y -= dy;
    return new AztecPoint(x, y);
  }
  /**
   * Expand the square represented by the corner points by pushing out equally in all directions
   *
   * @param cornerPoints the corners of the square, which has the bull's eye at its center
   * @param oldSide the original length of the side of the square in the target bit matrix
   * @param newSide the new length of the size of the square in the target bit matrix
   * @return the corners of the expanded square
   */
  expandSquare(cornerPoints, oldSide, newSide) {
    let ratio = newSide / (2 * oldSide);
    let dx = cornerPoints[0].getX() - cornerPoints[2].getX();
    let dy = cornerPoints[0].getY() - cornerPoints[2].getY();
    let centerx = (cornerPoints[0].getX() + cornerPoints[2].getX()) / 2;
    let centery = (cornerPoints[0].getY() + cornerPoints[2].getY()) / 2;
    let result0 = new ResultPoint.ResultPoint(centerx + ratio * dx, centery + ratio * dy);
    let result2 = new ResultPoint.ResultPoint(centerx - ratio * dx, centery - ratio * dy);
    dx = cornerPoints[1].getX() - cornerPoints[3].getX();
    dy = cornerPoints[1].getY() - cornerPoints[3].getY();
    centerx = (cornerPoints[1].getX() + cornerPoints[3].getX()) / 2;
    centery = (cornerPoints[1].getY() + cornerPoints[3].getY()) / 2;
    let result1 = new ResultPoint.ResultPoint(centerx + ratio * dx, centery + ratio * dy);
    let result3 = new ResultPoint.ResultPoint(centerx - ratio * dx, centery - ratio * dy);
    let results = [result0, result1, result2, result3];
    return results;
  }
  isValid(x, y) {
    return x >= 0 && x < this.image.getWidth() && y > 0 && y < this.image.getHeight();
  }
  isValidPoint(point) {
    let x = MathUtils.MathUtils.round(point.getX());
    let y = MathUtils.MathUtils.round(point.getY());
    return this.isValid(x, y);
  }
  distancePoint(a, b) {
    return MathUtils.MathUtils.distance(a.getX(), a.getY(), b.getX(), b.getY());
  }
  distanceResultPoint(a, b) {
    return MathUtils.MathUtils.distance(a.getX(), a.getY(), b.getX(), b.getY());
  }
  getDimension() {
    if (this.compact) {
      return 4 * this.nbLayers + 11;
    }
    if (this.nbLayers <= 4) {
      return 4 * this.nbLayers + 15;
    }
    return 4 * this.nbLayers + 2 * (ZXingInteger.ZXingInteger.truncDivision(this.nbLayers - 4, 8) + 1) + 15;
  }
}

exports.AztecDetector = AztecDetector;
exports.AztecPoint = AztecPoint;
//# sourceMappingURL=AztecDetector.cjs.map
//# sourceMappingURL=AztecDetector.cjs.map