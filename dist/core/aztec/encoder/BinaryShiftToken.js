import { SimpleToken } from './SimpleToken';

class BinaryShiftToken extends SimpleToken {
  binaryShiftStart;
  binaryShiftByteCount;
  constructor(previous, binaryShiftStart, binaryShiftByteCount) {
    super(previous, 0, 0);
    this.binaryShiftStart = binaryShiftStart;
    this.binaryShiftByteCount = binaryShiftByteCount;
  }
  /**
   * @Override
   */
  appendTo(bitArray, text) {
    for (let i = 0; i < this.binaryShiftByteCount; i++) {
      if (i === 0 || i === 31 && this.binaryShiftByteCount <= 62) {
        bitArray.appendBits(31, 5);
        if (this.binaryShiftByteCount > 62) {
          bitArray.appendBits(this.binaryShiftByteCount - 31, 16);
        } else if (i === 0) {
          bitArray.appendBits(Math.min(this.binaryShiftByteCount, 31), 5);
        } else {
          bitArray.appendBits(this.binaryShiftByteCount - 31, 5);
        }
      }
      bitArray.appendBits(text[this.binaryShiftStart + i], 8);
    }
  }
  addBinaryShift(start, byteCount) {
    return new BinaryShiftToken(this, start, byteCount);
  }
  /**
   * @Override
   */
  toString() {
    return "<" + this.binaryShiftStart + "::" + (this.binaryShiftStart + this.binaryShiftByteCount - 1) + ">";
  }
}

export { BinaryShiftToken };
//# sourceMappingURL=BinaryShiftToken.js.map
//# sourceMappingURL=BinaryShiftToken.js.map