'use strict';

var AbstractExpandedDecoder = require('./AbstractExpandedDecoder');

class AI01decoder extends AbstractExpandedDecoder.AbstractExpandedDecoder {
  static GTIN_SIZE = 40;
  constructor(information) {
    super(information);
  }
  encodeCompressedGtin(buf, currentPos) {
    buf.append("(01)");
    const initialPosition = buf.length();
    buf.append("9");
    this.encodeCompressedGtinWithoutAI(buf, currentPos, initialPosition);
  }
  encodeCompressedGtinWithoutAI(buf, currentPos, initialBufferPosition) {
    for (let i = 0; i < 4; ++i) {
      const currentBlock = this.getGeneralDecoder().extractNumericValueFromBitArray(currentPos + 10 * i, 10);
      if (currentBlock < 100) {
        buf.append("0");
      }
      if (currentBlock < 10) {
        buf.append("0");
      }
      buf.append("" + currentBlock);
    }
    AI01decoder.appendCheckDigit(buf, initialBufferPosition);
  }
  static appendCheckDigit(buf, currentPos) {
    let checkDigit = 0;
    for (let i = 0; i < 13; i++) {
      const digit = buf.charAt(i + currentPos).charCodeAt(0) - "0".charCodeAt(0);
      checkDigit += (i & 1) === 0 ? 3 * digit : digit;
    }
    checkDigit = 10 - checkDigit % 10;
    if (checkDigit === 10) {
      checkDigit = 0;
    }
    buf.append("" + checkDigit);
  }
}

exports.AI01decoder = AI01decoder;
//# sourceMappingURL=AI01decoder.cjs.map
//# sourceMappingURL=AI01decoder.cjs.map