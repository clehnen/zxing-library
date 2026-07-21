import { InvertedLuminanceSource } from './InvertedLuminanceSource';
import { LuminanceSource } from './LuminanceSource';
import { ZXingSystem } from './util/ZXingSystem';
import { IllegalArgumentException } from './IllegalArgumentException';

class RGBLuminanceSource extends LuminanceSource {
  constructor(luminances, width, height, dataWidth, dataHeight, left, top) {
    super(width, height);
    this.dataWidth = dataWidth;
    this.dataHeight = dataHeight;
    this.left = left;
    this.top = top;
    if (luminances.BYTES_PER_ELEMENT === 4) {
      const size = width * height;
      const luminancesUint8Array = new Uint8ClampedArray(size);
      for (let offset = 0; offset < size; offset++) {
        const pixel = luminances[offset];
        const r = pixel >> 16 & 255;
        const g2 = pixel >> 7 & 510;
        const b = pixel & 255;
        luminancesUint8Array[offset] = /*(byte) */
        (r + g2 + b) / 4 & 255;
      }
      this.luminances = luminancesUint8Array;
    } else {
      this.luminances = luminances;
    }
    if (void 0 === dataWidth) {
      this.dataWidth = width;
    }
    if (void 0 === dataHeight) {
      this.dataHeight = height;
    }
    if (void 0 === left) {
      this.left = 0;
    }
    if (void 0 === top) {
      this.top = 0;
    }
    if (this.left + width > this.dataWidth || this.top + height > this.dataHeight) {
      throw new IllegalArgumentException("Crop rectangle does not fit within image data.");
    }
  }
  dataWidth;
  dataHeight;
  left;
  top;
  // public constructor(width: number /*int*/, height: number /*int*/, const pixels: Int32Array) {
  //   super(width, height)
  //   dataWidth = width
  //   dataHeight = height
  //   left = 0
  //   top = 0
  //   // In order to measure pure decoding speed, we convert the entire image to a greyscale array
  //   // up front, which is the same as the Y channel of the YUVLuminanceSource in the real app.
  //   //
  //   // Total number of pixels suffices, can ignore shape
  //   const size = width * height;
  //   luminances = new byte[size]
  //   for (let offset = 0; offset < size; offset++) {
  //     const pixel = pixels[offset]
  //     const r = (pixel >> 16) & 0xff; // red
  //     const g2 = (pixel >> 7) & 0x1fe; // 2 * green
  //     const b = pixel & 0xff; // blue
  //     // Calculate green-favouring average cheaply
  //     luminances[offset] = (byte) ((r + g2 + b) / 4)
  //   }
  // }
  luminances;
  /*@Override*/
  getRow(y, row) {
    if (y < 0 || y >= this.getHeight()) {
      throw new IllegalArgumentException("Requested row is outside the image: " + y);
    }
    const width = this.getWidth();
    if (row === null || row === void 0 || row.length < width) {
      row = new Uint8ClampedArray(width);
    }
    const offset = (y + this.top) * this.dataWidth + this.left;
    ZXingSystem.arraycopy(this.luminances, offset, row, 0, width);
    return row;
  }
  /*@Override*/
  getMatrix() {
    const width = this.getWidth();
    const height = this.getHeight();
    if (width === this.dataWidth && height === this.dataHeight) {
      return this.luminances;
    }
    const area = width * height;
    const matrix = new Uint8ClampedArray(area);
    let inputOffset = this.top * this.dataWidth + this.left;
    if (width === this.dataWidth) {
      ZXingSystem.arraycopy(this.luminances, inputOffset, matrix, 0, area);
      return matrix;
    }
    for (let y = 0; y < height; y++) {
      const outputOffset = y * width;
      ZXingSystem.arraycopy(this.luminances, inputOffset, matrix, outputOffset, width);
      inputOffset += this.dataWidth;
    }
    return matrix;
  }
  /*@Override*/
  isCropSupported() {
    return true;
  }
  /*@Override*/
  crop(left, top, width, height) {
    return new RGBLuminanceSource(
      this.luminances,
      width,
      height,
      this.dataWidth,
      this.dataHeight,
      this.left + left,
      this.top + top
    );
  }
  invert() {
    return new InvertedLuminanceSource(this);
  }
}

export { RGBLuminanceSource };
//# sourceMappingURL=RGBLuminanceSource.js.map
//# sourceMappingURL=RGBLuminanceSource.js.map