import { AI01decoder } from './AI01decoder';

class AI01weightDecoder extends AI01decoder {
  constructor(information) {
    super(information);
  }
  encodeCompressedWeight(buf, currentPos, weightSize) {
    let originalWeightNumeric = this.getGeneralDecoder().extractNumericValueFromBitArray(currentPos, weightSize);
    this.addWeightCode(buf, originalWeightNumeric);
    const weightNumeric = this.checkWeight(originalWeightNumeric);
    let currentDivisor = 1e5;
    for (let i = 0; i < 5; ++i) {
      if (weightNumeric < currentDivisor) {
        buf.append("0");
      }
      currentDivisor = Math.trunc(currentDivisor / 10);
    }
    buf.append("" + weightNumeric);
  }
}

export { AI01weightDecoder };
//# sourceMappingURL=AI01weightDecoder.js.map
//# sourceMappingURL=AI01weightDecoder.js.map