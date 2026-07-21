'use strict';

var LuminanceSource = require('./LuminanceSource');

class InvertedLuminanceSource extends LuminanceSource.LuminanceSource {
  constructor(delegate) {
    super(delegate.getWidth(), delegate.getHeight());
    this.delegate = delegate;
  }
  delegate;
  /*@Override*/
  getRow(y, row) {
    const sourceRow = this.delegate.getRow(y, row);
    const width = this.getWidth();
    for (let i = 0; i < width; i++) {
      sourceRow[i] = /*(byte)*/
      255 - (sourceRow[i] & 255);
    }
    return sourceRow;
  }
  /*@Override*/
  getMatrix() {
    const matrix = this.delegate.getMatrix();
    const length = this.getWidth() * this.getHeight();
    const invertedMatrix = new Uint8ClampedArray(length);
    for (let i = 0; i < length; i++) {
      invertedMatrix[i] = /*(byte)*/
      255 - (matrix[i] & 255);
    }
    return invertedMatrix;
  }
  /*@Override*/
  isCropSupported() {
    return this.delegate.isCropSupported();
  }
  /*@Override*/
  crop(left, top, width, height) {
    return new InvertedLuminanceSource(this.delegate.crop(left, top, width, height));
  }
  /*@Override*/
  isRotateSupported() {
    return this.delegate.isRotateSupported();
  }
  /**
   * @return original delegate {@link LuminanceSource} since invert undoes itself
   */
  /*@Override*/
  invert() {
    return this.delegate;
  }
  /*@Override*/
  rotateCounterClockwise() {
    return new InvertedLuminanceSource(this.delegate.rotateCounterClockwise());
  }
  /*@Override*/
  rotateCounterClockwise45() {
    return new InvertedLuminanceSource(this.delegate.rotateCounterClockwise45());
  }
}

exports.InvertedLuminanceSource = InvertedLuminanceSource;
//# sourceMappingURL=InvertedLuminanceSource.cjs.map
//# sourceMappingURL=InvertedLuminanceSource.cjs.map