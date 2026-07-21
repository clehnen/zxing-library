import { ZXingStringBuilder } from '../../../../util/StringBuilder';
import { AbstractExpandedDecoder } from './AbstractExpandedDecoder';

class AnyAIDecoder extends AbstractExpandedDecoder {
  static HEADER_SIZE = 2 + 1 + 2;
  constructor(information) {
    super(information);
  }
  parseInformation() {
    let buf = new ZXingStringBuilder();
    return this.getGeneralDecoder().decodeAllCodes(buf, AnyAIDecoder.HEADER_SIZE);
  }
}

export { AnyAIDecoder };
//# sourceMappingURL=AnyAIDecoder.js.map
//# sourceMappingURL=AnyAIDecoder.js.map