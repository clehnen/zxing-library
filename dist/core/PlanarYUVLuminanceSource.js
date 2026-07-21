import { ZXingSystem } from './util/ZXingSystem';
import { LuminanceSource } from './LuminanceSource';
import { InvertedLuminanceSource } from './InvertedLuminanceSource';
import { IllegalArgumentException } from './IllegalArgumentException';

class PlanarYUVLuminanceSource extends LuminanceSource {
  constructor(yuvData, dataWidth, dataHeight, left, top, width, height, reverseHorizontal) {
    super(width, height);
    this.yuvData = yuvData;
    this.dataWidth = dataWidth;
    this.dataHeight = dataHeight;
    this.left = left;
    this.top = top;
    if (left + width > dataWidth || top + height > dataHeight) {
      throw new IllegalArgumentException("Crop rectangle does not fit within image data.");
    }
    if (reverseHorizontal) {
      this.reverseHorizontal(width, height);
    }
  }
  yuvData;
  dataWidth;
  dataHeight;
  left;
  top;
  static THUMBNAIL_SCALE_FACTOR = 2;
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
    ZXingSystem.arraycopy(this.yuvData, offset, row, 0, width);
    return row;
  }
  /*@Override*/
  getMatrix() {
    const width = this.getWidth();
    const height = this.getHeight();
    if (width === this.dataWidth && height === this.dataHeight) {
      return this.yuvData;
    }
    const area = width * height;
    const matrix = new Uint8ClampedArray(area);
    let inputOffset = this.top * this.dataWidth + this.left;
    if (width === this.dataWidth) {
      ZXingSystem.arraycopy(this.yuvData, inputOffset, matrix, 0, area);
      return matrix;
    }
    for (let y = 0; y < height; y++) {
      const outputOffset = y * width;
      ZXingSystem.arraycopy(this.yuvData, inputOffset, matrix, outputOffset, width);
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
    return new PlanarYUVLuminanceSource(
      this.yuvData,
      this.dataWidth,
      this.dataHeight,
      this.left + left,
      this.top + top,
      width,
      height,
      false
    );
  }
  renderThumbnail() {
    const width = this.getWidth() / PlanarYUVLuminanceSource.THUMBNAIL_SCALE_FACTOR;
    const height = this.getHeight() / PlanarYUVLuminanceSource.THUMBNAIL_SCALE_FACTOR;
    const pixels = new Int32Array(width * height);
    const yuv = this.yuvData;
    let inputOffset = this.top * this.dataWidth + this.left;
    for (let y = 0; y < height; y++) {
      const outputOffset = y * width;
      for (let x = 0; x < width; x++) {
        const grey = yuv[inputOffset + x * PlanarYUVLuminanceSource.THUMBNAIL_SCALE_FACTOR] & 255;
        pixels[outputOffset + x] = 4278190080 | grey * 65793;
      }
      inputOffset += this.dataWidth * PlanarYUVLuminanceSource.THUMBNAIL_SCALE_FACTOR;
    }
    return pixels;
  }
  /**
   * @return width of image from {@link #renderThumbnail()}
   */
  getThumbnailWidth() {
    return this.getWidth() / PlanarYUVLuminanceSource.THUMBNAIL_SCALE_FACTOR;
  }
  /**
   * @return height of image from {@link #renderThumbnail()}
   */
  getThumbnailHeight() {
    return this.getHeight() / PlanarYUVLuminanceSource.THUMBNAIL_SCALE_FACTOR;
  }
  reverseHorizontal(width, height) {
    const yuvData = this.yuvData;
    for (let y = 0, rowStart = this.top * this.dataWidth + this.left; y < height; y++, rowStart += this.dataWidth) {
      const middle = rowStart + width / 2;
      for (let x1 = rowStart, x2 = rowStart + width - 1; x1 < middle; x1++, x2--) {
        const temp = yuvData[x1];
        yuvData[x1] = yuvData[x2];
        yuvData[x2] = temp;
      }
    }
  }
  invert() {
    return new InvertedLuminanceSource(this);
  }
}

export { PlanarYUVLuminanceSource };
//# sourceMappingURL=PlanarYUVLuminanceSource.js.map
//# sourceMappingURL=PlanarYUVLuminanceSource.js.map