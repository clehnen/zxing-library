import { AI013x0xDecoder } from './AI013x0xDecoder';
import { BitArray } from '../../../../common/BitArray';
import { ZXingStringBuilder } from '../../../../util/StringBuilder';

export class AI013103decoder extends AI013x0xDecoder {
  constructor(information: BitArray) {
    super(information);
  }

  protected addWeightCode(buf: ZXingStringBuilder, weight: number): void {
    buf.append('(3103)');
  }

  protected checkWeight(weight: number): number {
    return weight;
  }

}
