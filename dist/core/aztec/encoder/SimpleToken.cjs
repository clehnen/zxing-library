'use strict';

var Token = require('./Token');
var ZXingInteger = require('../../util/ZXingInteger');

class SimpleToken extends Token.Token {
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
    return "<" + ZXingInteger.ZXingInteger.toBinaryString(value | 1 << this.bitCount).substring(1) + ">";
  }
}

exports.SimpleToken = SimpleToken;
//# sourceMappingURL=SimpleToken.cjs.map
//# sourceMappingURL=SimpleToken.cjs.map