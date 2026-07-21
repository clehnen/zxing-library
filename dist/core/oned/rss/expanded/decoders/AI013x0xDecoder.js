import { AI01weightDecoder } from './AI01weightDecoder';
import { ZXingStringBuilder } from '../../../../util/StringBuilder';
import { NotFoundException } from '../../../../NotFoundException';

class AI013x0xDecoder extends AI01weightDecoder {
  static HEADER_SIZE = 4 + 1;
  static WEIGHT_SIZE = 15;
  constructor(information) {
    super(information);
  }
  parseInformation() {
    if (this.getInformation().getSize() !== AI013x0xDecoder.HEADER_SIZE + AI01weightDecoder.GTIN_SIZE + AI013x0xDecoder.WEIGHT_SIZE) {
      throw new NotFoundException();
    }
    let buf = new ZXingStringBuilder();
    this.encodeCompressedGtin(buf, AI013x0xDecoder.HEADER_SIZE);
    this.encodeCompressedWeight(
      buf,
      AI013x0xDecoder.HEADER_SIZE + AI01weightDecoder.GTIN_SIZE,
      AI013x0xDecoder.WEIGHT_SIZE
    );
    return buf.toString();
  }
}

export { AI013x0xDecoder };
//# sourceMappingURL=AI013x0xDecoder.js.map
//# sourceMappingURL=AI013x0xDecoder.js.map