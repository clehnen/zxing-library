import { ZXingArrays } from '../../util/ZXingArrays';
import { ZXingStringBuilder } from '../../util/StringBuilder';

class QRCodeByteMatrix {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    const bytes = new Array(height);
    for (let i = 0; i !== height; i++) {
      bytes[i] = new Uint8Array(width);
    }
    this.bytes = bytes;
  }
  width;
  height;
  bytes;
  getHeight() {
    return this.height;
  }
  getWidth() {
    return this.width;
  }
  get(x, y) {
    return this.bytes[y][x];
  }
  /**
   * @return an internal representation as bytes, in row-major order. array[y][x] represents point (x,y)
   */
  getArray() {
    return this.bytes;
  }
  // TYPESCRIPTPORT: preffer to let two methods instead of override to avoid type comparison inside
  setNumber(x, y, value) {
    this.bytes[y][x] = value;
  }
  // public set(x: number /*int*/, y: number /*int*/, value: number /*int*/): void {
  //   bytes[y][x] = (byte) value
  // }
  setBoolean(x, y, value) {
    this.bytes[y][x] = /*(byte) */
    value ? 1 : 0;
  }
  clear(value) {
    for (const aByte of this.bytes) {
      ZXingArrays.fill(aByte, value);
    }
  }
  equals(o) {
    if (!(o instanceof QRCodeByteMatrix)) {
      return false;
    }
    const other = o;
    if (this.width !== other.width) {
      return false;
    }
    if (this.height !== other.height) {
      return false;
    }
    for (let y = 0, height = this.height; y < height; ++y) {
      const bytesY = this.bytes[y];
      const otherBytesY = other.bytes[y];
      for (let x = 0, width = this.width; x < width; ++x) {
        if (bytesY[x] !== otherBytesY[x]) {
          return false;
        }
      }
    }
    return true;
  }
  /*@Override*/
  toString() {
    const result = new ZXingStringBuilder();
    for (let y = 0, height = this.height; y < height; ++y) {
      const bytesY = this.bytes[y];
      for (let x = 0, width = this.width; x < width; ++x) {
        switch (bytesY[x]) {
          case 0:
            result.append(" 0");
            break;
          case 1:
            result.append(" 1");
            break;
          default:
            result.append("  ");
            break;
        }
      }
      result.append("\n");
    }
    return result.toString();
  }
}

export { QRCodeByteMatrix };
//# sourceMappingURL=QRCodeByteMatrix.js.map
//# sourceMappingURL=QRCodeByteMatrix.js.map