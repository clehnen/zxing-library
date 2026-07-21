import { BitArray } from '../../../../common/BitArray';
import { ZXingStringBuilder } from '../../../../util/StringBuilder';
import { AI01decoder } from './AI01decoder';

export abstract class AI01weightDecoder extends AI01decoder {

  constructor(information: BitArray) {
    super(information);
  }

  encodeCompressedWeight(buf: ZXingStringBuilder, currentPos: number, weightSize: number): void {
    let originalWeightNumeric = this.getGeneralDecoder().extractNumericValueFromBitArray(currentPos, weightSize);
    this.addWeightCode(buf, originalWeightNumeric);

    const weightNumeric /* int */ = this.checkWeight(originalWeightNumeric);

    let currentDivisor = 100000;
    // Pad with leading zeroes.
    for (let i = 0; i < 5; ++i) {
      if (weightNumeric < currentDivisor) {
        buf.append('0');
      }
      currentDivisor = Math.trunc(currentDivisor / 10);
    }
    buf.append('' + weightNumeric);
  }

  protected abstract addWeightCode(buf: ZXingStringBuilder, weight: number): void;

  protected abstract checkWeight(weight: number): number;
}
