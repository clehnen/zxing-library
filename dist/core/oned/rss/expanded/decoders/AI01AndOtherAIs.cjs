'use strict';

var AI01decoder = require('./AI01decoder');
var StringBuilder = require('../../../../util/StringBuilder');

class AI01AndOtherAIs extends AI01decoder.AI01decoder {
  static HEADER_SIZE = 1 + 1 + 2;
  // first bit encodes the linkage flag,
  // the second one is the encodation method, and the other two are for the variable length
  constructor(information) {
    super(information);
  }
  parseInformation() {
    const buff = new StringBuilder.ZXingStringBuilder();
    buff.append("(01)");
    const initialGtinPosition = buff.length();
    const firstGtinDigit = this.getGeneralDecoder().extractNumericValueFromBitArray(AI01AndOtherAIs.HEADER_SIZE, 4);
    buff.append("" + firstGtinDigit);
    this.encodeCompressedGtinWithoutAI(buff, AI01AndOtherAIs.HEADER_SIZE + 4, initialGtinPosition);
    return this.getGeneralDecoder().decodeAllCodes(buff, AI01AndOtherAIs.HEADER_SIZE + 44);
  }
}

exports.AI01AndOtherAIs = AI01AndOtherAIs;
//# sourceMappingURL=AI01AndOtherAIs.cjs.map
//# sourceMappingURL=AI01AndOtherAIs.cjs.map