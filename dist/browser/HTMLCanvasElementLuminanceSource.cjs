'use strict';

var InvertedLuminanceSource = require('../core/InvertedLuminanceSource');
var LuminanceSource = require('../core/LuminanceSource');
var IllegalArgumentException = require('../core/IllegalArgumentException');

class HTMLCanvasElementLuminanceSource extends LuminanceSource.LuminanceSource {
  constructor(canvas, doAutoInvert = false, reuseBuffer) {
    super(canvas.width, canvas.height);
    this.canvas = canvas;
    this.buffer = HTMLCanvasElementLuminanceSource.makeBufferFromCanvasImageData(canvas, doAutoInvert, reuseBuffer);
  }
  canvas;
  buffer;
  static DEGREE_TO_RADIANS = Math.PI / 180;
  static FRAME_INDEX = true;
  tempCanvasElement = null;
  static makeBufferFromCanvasImageData(canvas, doAutoInvert = false, reuseBuffer) {
    const imageData = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
    return HTMLCanvasElementLuminanceSource.toGrayscaleBuffer(imageData.data, canvas.width, canvas.height, doAutoInvert, reuseBuffer);
  }
  static toGrayscaleBuffer(imageBuffer, width, height, doAutoInvert = false, reuseBuffer) {
    const size = width * height;
    const grayscaleBuffer = reuseBuffer && reuseBuffer.length >= size ? reuseBuffer : new Uint8ClampedArray(size);
    HTMLCanvasElementLuminanceSource.FRAME_INDEX = !HTMLCanvasElementLuminanceSource.FRAME_INDEX;
    const invertMask = !HTMLCanvasElementLuminanceSource.FRAME_INDEX && doAutoInvert ? 255 : 0;
    for (let i = 0, j = 0, length = imageBuffer.length; i < length; i += 4, j++) {
      let gray;
      const alpha = imageBuffer[i + 3];
      if (alpha === 0) {
        gray = 255;
      } else {
        const pixelR = imageBuffer[i];
        const pixelG = imageBuffer[i + 1];
        const pixelB = imageBuffer[i + 2];
        gray = 306 * pixelR + 601 * pixelG + 117 * pixelB + 512 >> 10;
      }
      grayscaleBuffer[j] = gray ^ invertMask;
    }
    return grayscaleBuffer;
  }
  getRow(y, row) {
    if (y < 0 || y >= this.getHeight()) {
      throw new IllegalArgumentException.IllegalArgumentException("Requested row is outside the image: " + y);
    }
    const width = this.getWidth();
    const start = y * width;
    if (row === null) {
      row = this.buffer.slice(start, start + width);
    } else {
      if (row.length < width) {
        row = new Uint8ClampedArray(width);
      }
      row.set(this.buffer.subarray(start, start + width));
    }
    return row;
  }
  getMatrix() {
    return this.buffer;
  }
  isCropSupported() {
    return true;
  }
  crop(left, top, width, height) {
    super.crop(left, top, width, height);
    return this;
  }
  /**
   * This is always true, since the image is a gray-scale image.
   *
   * @return true
   */
  isRotateSupported() {
    return true;
  }
  rotateCounterClockwise() {
    this.rotate(-90);
    return this;
  }
  rotateCounterClockwise45() {
    this.rotate(-45);
    return this;
  }
  getTempCanvasElement() {
    if (null === this.tempCanvasElement) {
      const tempCanvasElement = this.canvas.ownerDocument.createElement("canvas");
      tempCanvasElement.width = this.canvas.width;
      tempCanvasElement.height = this.canvas.height;
      this.tempCanvasElement = tempCanvasElement;
    }
    return this.tempCanvasElement;
  }
  rotate(angle) {
    const tempCanvasElement = this.getTempCanvasElement();
    const tempContext = tempCanvasElement.getContext("2d");
    const angleRadians = angle * HTMLCanvasElementLuminanceSource.DEGREE_TO_RADIANS;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const newWidth = Math.ceil(Math.abs(Math.cos(angleRadians)) * width + Math.abs(Math.sin(angleRadians)) * height);
    const newHeight = Math.ceil(Math.abs(Math.sin(angleRadians)) * width + Math.abs(Math.cos(angleRadians)) * height);
    tempCanvasElement.width = newWidth;
    tempCanvasElement.height = newHeight;
    tempContext.translate(newWidth / 2, newHeight / 2);
    tempContext.rotate(angleRadians);
    tempContext.drawImage(this.canvas, width / -2, height / -2);
    this.buffer = HTMLCanvasElementLuminanceSource.makeBufferFromCanvasImageData(tempCanvasElement);
    return this;
  }
  invert() {
    return new InvertedLuminanceSource.InvertedLuminanceSource(this);
  }
}

exports.HTMLCanvasElementLuminanceSource = HTMLCanvasElementLuminanceSource;
//# sourceMappingURL=HTMLCanvasElementLuminanceSource.cjs.map
//# sourceMappingURL=HTMLCanvasElementLuminanceSource.cjs.map