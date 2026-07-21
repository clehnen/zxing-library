import { ZXingStringBuilder } from './util/StringBuilder';
import { UnsupportedOperationException } from './UnsupportedOperationException';

class LuminanceSource {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  width;
  height;
  /**
   * @return The width of the bitmap.
   */
  getWidth() {
    return this.width;
  }
  /**
   * @return The height of the bitmap.
   */
  getHeight() {
    return this.height;
  }
  /**
   * @return Whether this subclass supports cropping.
   */
  isCropSupported() {
    return false;
  }
  /**
   * Returns a new object with cropped image data. Implementations may keep a reference to the
   * original data rather than a copy. Only callable if isCropSupported() is true.
   *
   * @param left The left coordinate, which must be in [0,getWidth())
   * @param top The top coordinate, which must be in [0,getHeight())
   * @param width The width of the rectangle to crop.
   * @param height The height of the rectangle to crop.
   * @return A cropped version of this object.
   */
  crop(left, top, width, height) {
    throw new UnsupportedOperationException("This luminance source does not support cropping.");
  }
  /**
   * @return Whether this subclass supports counter-clockwise rotation.
   */
  isRotateSupported() {
    return false;
  }
  /**
   * Returns a new object with rotated image data by 90 degrees counterclockwise.
   * Only callable if {@link #isRotateSupported()} is true.
   *
   * @return A rotated version of this object.
   */
  rotateCounterClockwise() {
    throw new UnsupportedOperationException("This luminance source does not support rotation by 90 degrees.");
  }
  /**
   * Returns a new object with rotated image data by 45 degrees counterclockwise.
   * Only callable if {@link #isRotateSupported()} is true.
   *
   * @return A rotated version of this object.
   */
  rotateCounterClockwise45() {
    throw new UnsupportedOperationException("This luminance source does not support rotation by 45 degrees.");
  }
  /*@Override*/
  toString() {
    const row = new Uint8ClampedArray(this.width);
    let result = new ZXingStringBuilder();
    for (let y = 0; y < this.height; y++) {
      const sourceRow = this.getRow(y, row);
      for (let x = 0; x < this.width; x++) {
        const luminance = sourceRow[x] & 255;
        let c;
        if (luminance < 64) {
          c = "#";
        } else if (luminance < 128) {
          c = "+";
        } else if (luminance < 192) {
          c = ".";
        } else {
          c = " ";
        }
        result.append(c);
      }
      result.append("\n");
    }
    return result.toString();
  }
}

export { LuminanceSource };
//# sourceMappingURL=LuminanceSource.js.map
//# sourceMappingURL=LuminanceSource.js.map