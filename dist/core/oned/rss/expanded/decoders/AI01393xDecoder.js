import { AI01decoder } from './AI01decoder';
import { NotFoundException } from '../../../../NotFoundException';
import { ZXingStringBuilder } from '../../../../util/StringBuilder';

class AI01393xDecoder extends AI01decoder {
  static HEADER_SIZE = 5 + 1 + 2;
  static LAST_DIGIT_SIZE = 2;
  static FIRST_THREE_DIGITS_SIZE = 10;
  constructor(information) {
    super(information);
  }
  parseInformation() {
    if (this.getInformation().getSize() < AI01393xDecoder.HEADER_SIZE + AI01decoder.GTIN_SIZE) {
      throw new NotFoundException();
    }
    const buf = new ZXingStringBuilder();
    this.encodeCompressedGtin(buf, AI01393xDecoder.HEADER_SIZE);
    const lastAIdigit = this.getGeneralDecoder().extractNumericValueFromBitArray(
      AI01393xDecoder.HEADER_SIZE + AI01decoder.GTIN_SIZE,
      AI01393xDecoder.LAST_DIGIT_SIZE
    );
    buf.append("(393");
    buf.append("" + lastAIdigit);
    buf.append(")");
    const firstThreeDigits = this.getGeneralDecoder().extractNumericValueFromBitArray(
      AI01393xDecoder.HEADER_SIZE + AI01decoder.GTIN_SIZE + AI01393xDecoder.LAST_DIGIT_SIZE,
      AI01393xDecoder.FIRST_THREE_DIGITS_SIZE
    );
    if (firstThreeDigits < 100) {
      buf.append("0");
    }
    if (firstThreeDigits < 10) {
      buf.append("0");
    }
    buf.append("" + firstThreeDigits);
    const generalInformation = this.getGeneralDecoder().decodeGeneralPurposeField(
      AI01393xDecoder.HEADER_SIZE + AI01decoder.GTIN_SIZE + AI01393xDecoder.LAST_DIGIT_SIZE + AI01393xDecoder.FIRST_THREE_DIGITS_SIZE,
      null
    );
    buf.append(generalInformation.getNewString());
    return buf.toString();
  }
}

export { AI01393xDecoder };
//# sourceMappingURL=AI01393xDecoder.js.map
//# sourceMappingURL=AI01393xDecoder.js.map