import { StringUtils } from '../../common/StringUtils';
import { ZXingStringBuilder } from '../../util/StringBuilder';
import { EDIFACT_ENCODATION, ASCII_ENCODATION } from './constants';
import { DataMatrixHighLevelEncoder } from './DataMatrixHighLevelEncoder';

class EdifactEncoder {
  getEncodingMode() {
    return EDIFACT_ENCODATION;
  }
  encode(context) {
    const buffer = new ZXingStringBuilder();
    while (context.hasMoreCharacters()) {
      const c = context.getCurrentChar();
      this.encodeChar(c, buffer);
      context.pos++;
      const count = buffer.length();
      if (count >= 4) {
        context.writeCodewords(this.encodeToCodewords(buffer.toString()));
        const test = buffer.toString().substring(4);
        buffer.setLengthToZero();
        buffer.append(test);
        const newMode = DataMatrixHighLevelEncoder.lookAheadTest(
          context.getMessage(),
          context.pos,
          this.getEncodingMode()
        );
        if (newMode !== this.getEncodingMode()) {
          context.signalEncoderChange(ASCII_ENCODATION);
          break;
        }
      }
    }
    buffer.append(StringUtils.getCharAt(31));
    this.handleEOD(context, buffer);
  }
  /**
   * Handle "end of data" situations
   *
   * @param context the encoder context
   * @param buffer  the buffer with the remaining encoded characters
   */
  handleEOD(context, buffer) {
    try {
      const count = buffer.length();
      if (count === 0) {
        return;
      }
      if (count === 1) {
        context.updateSymbolInfo();
        let available = context.getSymbolInfo().getDataCapacity() - context.getCodewordCount();
        const remaining = context.getRemainingCharacters();
        if (remaining > available) {
          context.updateSymbolInfo(context.getCodewordCount() + 1);
          available = context.getSymbolInfo().getDataCapacity() - context.getCodewordCount();
        }
        if (remaining <= available && available <= 2) {
          return;
        }
      }
      if (count > 4) {
        throw new Error("Count must not exceed 4");
      }
      const restChars = count - 1;
      const encoded = this.encodeToCodewords(buffer.toString());
      const endOfSymbolReached = !context.hasMoreCharacters();
      let restInAscii = endOfSymbolReached && restChars <= 2;
      if (restChars <= 2) {
        context.updateSymbolInfo(context.getCodewordCount() + restChars);
        const available = context.getSymbolInfo().getDataCapacity() - context.getCodewordCount();
        if (available >= 3) {
          restInAscii = false;
          context.updateSymbolInfo(context.getCodewordCount() + encoded.length);
        }
      }
      if (restInAscii) {
        context.resetSymbolInfo();
        context.pos -= restChars;
      } else {
        context.writeCodewords(encoded);
      }
    } finally {
      context.signalEncoderChange(ASCII_ENCODATION);
    }
  }
  encodeChar(c, sb) {
    if (c >= " ".charCodeAt(0) && c <= "?".charCodeAt(0)) {
      sb.append(c);
    } else if (c >= "@".charCodeAt(0) && c <= "^".charCodeAt(0)) {
      sb.append(StringUtils.getCharAt(c - 64));
    } else {
      DataMatrixHighLevelEncoder.illegalCharacter(StringUtils.getCharAt(c));
    }
  }
  encodeToCodewords(sb) {
    const len = sb.length;
    if (len === 0) {
      throw new Error("StringBuilder must not be empty");
    }
    const c1 = sb.charAt(0).charCodeAt(0);
    const c2 = len >= 2 ? sb.charAt(1).charCodeAt(0) : 0;
    const c3 = len >= 3 ? sb.charAt(2).charCodeAt(0) : 0;
    const c4 = len >= 4 ? sb.charAt(3).charCodeAt(0) : 0;
    const v = (c1 << 18) + (c2 << 12) + (c3 << 6) + c4;
    const cw1 = v >> 16 & 255;
    const cw2 = v >> 8 & 255;
    const cw3 = v & 255;
    const res = new ZXingStringBuilder();
    res.append(cw1);
    if (len >= 2) {
      res.append(cw2);
    }
    if (len >= 3) {
      res.append(cw3);
    }
    return res.toString();
  }
}

export { EdifactEncoder };
//# sourceMappingURL=EdifactEncoder.js.map
//# sourceMappingURL=EdifactEncoder.js.map