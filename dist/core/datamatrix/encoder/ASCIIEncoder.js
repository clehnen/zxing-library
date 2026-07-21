import { ASCII_ENCODATION, EDIFACT_ENCODATION, LATCH_TO_EDIFACT, TEXT_ENCODATION, LATCH_TO_TEXT, X12_ENCODATION, LATCH_TO_ANSIX12, C40_ENCODATION, LATCH_TO_C40, BASE256_ENCODATION, LATCH_TO_BASE256, UPPER_SHIFT } from './constants';
import { DataMatrixHighLevelEncoder } from './DataMatrixHighLevelEncoder';

class ASCIIEncoder {
  getEncodingMode() {
    return ASCII_ENCODATION;
  }
  encode(context) {
    const n = DataMatrixHighLevelEncoder.determineConsecutiveDigitCount(
      context.getMessage(),
      context.pos
    );
    if (n >= 2) {
      context.writeCodeword(
        this.encodeASCIIDigits(
          context.getMessage().charCodeAt(context.pos),
          context.getMessage().charCodeAt(context.pos + 1)
        )
      );
      context.pos += 2;
    } else {
      const c = context.getCurrentChar();
      const newMode = DataMatrixHighLevelEncoder.lookAheadTest(
        context.getMessage(),
        context.pos,
        this.getEncodingMode()
      );
      if (newMode !== this.getEncodingMode()) {
        switch (newMode) {
          case BASE256_ENCODATION:
            context.writeCodeword(LATCH_TO_BASE256);
            context.signalEncoderChange(BASE256_ENCODATION);
            return;
          case C40_ENCODATION:
            context.writeCodeword(LATCH_TO_C40);
            context.signalEncoderChange(C40_ENCODATION);
            return;
          case X12_ENCODATION:
            context.writeCodeword(LATCH_TO_ANSIX12);
            context.signalEncoderChange(X12_ENCODATION);
            break;
          case TEXT_ENCODATION:
            context.writeCodeword(LATCH_TO_TEXT);
            context.signalEncoderChange(TEXT_ENCODATION);
            break;
          case EDIFACT_ENCODATION:
            context.writeCodeword(LATCH_TO_EDIFACT);
            context.signalEncoderChange(EDIFACT_ENCODATION);
            break;
          default:
            throw new Error("Illegal mode: " + newMode);
        }
      } else if (DataMatrixHighLevelEncoder.isExtendedASCII(c)) {
        context.writeCodeword(UPPER_SHIFT);
        context.writeCodeword(c - 128 + 1);
        context.pos++;
      } else {
        context.writeCodeword(c + 1);
        context.pos++;
      }
    }
  }
  encodeASCIIDigits(digit1, digit2) {
    if (DataMatrixHighLevelEncoder.isDigit(digit1) && DataMatrixHighLevelEncoder.isDigit(digit2)) {
      const num = (digit1 - 48) * 10 + (digit2 - 48);
      return num + 130;
    }
    throw new Error("not digits: " + digit1 + digit2);
  }
}

export { ASCIIEncoder };
//# sourceMappingURL=ASCIIEncoder.js.map
//# sourceMappingURL=ASCIIEncoder.js.map