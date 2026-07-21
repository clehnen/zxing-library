import { AI01decoder } from './AI01decoder';
import { ZXingStringBuilder } from '../../../../util/StringBuilder';

class AI01AndOtherAIs extends AI01decoder {
  static HEADER_SIZE = 1 + 1 + 2;
  // first bit encodes the linkage flag,
  // the second one is the encodation method, and the other two are for the variable length
  constructor(information) {
    super(information);
  }
  parseInformation() {
    const buff = new ZXingStringBuilder();
    buff.append("(01)");
    const initialGtinPosition = buff.length();
    const firstGtinDigit = this.getGeneralDecoder().extractNumericValueFromBitArray(AI01AndOtherAIs.HEADER_SIZE, 4);
    buff.append("" + firstGtinDigit);
    this.encodeCompressedGtinWithoutAI(buff, AI01AndOtherAIs.HEADER_SIZE + 4, initialGtinPosition);
    return this.getGeneralDecoder().decodeAllCodes(buff, AI01AndOtherAIs.HEADER_SIZE + 44);
  }
}

export { AI01AndOtherAIs };
//# sourceMappingURL=AI01AndOtherAIs.js.map
//# sourceMappingURL=AI01AndOtherAIs.js.map