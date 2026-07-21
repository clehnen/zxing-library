import { Token } from './Token';
import { ZXingInteger } from '../../util/ZXingInteger';

class SimpleToken extends Token {
  // For normal words, indicates value and bitCount
  value;
  bitCount;
  constructor(previous, value, bitCount) {
    super(previous);
    this.value = value;
    this.bitCount = bitCount;
  }
  /**
   * @Override
   */
  appendTo(bitArray, text) {
    bitArray.appendBits(this.value, this.bitCount);
  }
  add(value, bitCount) {
    return new SimpleToken(this, value, bitCount);
  }
  addBinaryShift(start, byteCount) {
    console.warn("addBinaryShift on SimpleToken, this simply returns a copy of this token");
    return new SimpleToken(this, start, byteCount);
  }
  /**
   * @Override
   */
  toString() {
    let value = this.value & (1 << this.bitCount) - 1;
    value |= 1 << this.bitCount;
    return "<" + ZXingInteger.toBinaryString(value | 1 << this.bitCount).substring(1) + ">";
  }
}

export { SimpleToken };
//# sourceMappingURL=SimpleToken.js.map
//# sourceMappingURL=SimpleToken.js.map