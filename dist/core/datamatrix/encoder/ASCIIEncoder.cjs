'use strict';

var constants = require('./constants');
var DataMatrixHighLevelEncoder = require('./DataMatrixHighLevelEncoder');

class ASCIIEncoder {
  getEncodingMode() {
    return constants.ASCII_ENCODATION;
  }
  encode(context) {
    const n = DataMatrixHighLevelEncoder.DataMatrixHighLevelEncoder.determineConsecutiveDigitCount(
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
      const newMode = DataMatrixHighLevelEncoder.DataMatrixHighLevelEncoder.lookAheadTest(
        context.getMessage(),
        context.pos,
        this.getEncodingMode()
      );
      if (newMode !== this.getEncodingMode()) {
        switch (newMode) {
          case constants.BASE256_ENCODATION:
            context.writeCodeword(constants.LATCH_TO_BASE256);
            context.signalEncoderChange(constants.BASE256_ENCODATION);
            return;
          case constants.C40_ENCODATION:
            context.writeCodeword(constants.LATCH_TO_C40);
            context.signalEncoderChange(constants.C40_ENCODATION);
            return;
          case constants.X12_ENCODATION:
            context.writeCodeword(constants.LATCH_TO_ANSIX12);
            context.signalEncoderChange(constants.X12_ENCODATION);
            break;
          case constants.TEXT_ENCODATION:
            context.writeCodeword(constants.LATCH_TO_TEXT);
            context.signalEncoderChange(constants.TEXT_ENCODATION);
            break;
          case constants.EDIFACT_ENCODATION:
            context.writeCodeword(constants.LATCH_TO_EDIFACT);
            context.signalEncoderChange(constants.EDIFACT_ENCODATION);
            break;
          default:
            throw new Error("Illegal mode: " + newMode);
        }
      } else if (DataMatrixHighLevelEncoder.DataMatrixHighLevelEncoder.isExtendedASCII(c)) {
        context.writeCodeword(constants.UPPER_SHIFT);
        context.writeCodeword(c - 128 + 1);
        context.pos++;
      } else {
        context.writeCodeword(c + 1);
        context.pos++;
      }
    }
  }
  encodeASCIIDigits(digit1, digit2) {
    if (DataMatrixHighLevelEncoder.DataMatrixHighLevelEncoder.isDigit(digit1) && DataMatrixHighLevelEncoder.DataMatrixHighLevelEncoder.isDigit(digit2)) {
      const num = (digit1 - 48) * 10 + (digit2 - 48);
      return num + 130;
    }
    throw new Error("not digits: " + digit1 + digit2);
  }
}

exports.ASCIIEncoder = ASCIIEncoder;
//# sourceMappingURL=ASCIIEncoder.cjs.map
//# sourceMappingURL=ASCIIEncoder.cjs.map