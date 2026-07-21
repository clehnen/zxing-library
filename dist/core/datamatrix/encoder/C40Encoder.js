import { ZXingStringBuilder } from '../../util/StringBuilder';
import { DataMatrixHighLevelEncoder } from './DataMatrixHighLevelEncoder';
import { C40_ENCODATION, LATCH_TO_C40, ASCII_ENCODATION, C40_UNLATCH } from './constants';

class C40Encoder {
  getEncodingMode() {
    return C40_ENCODATION;
  }
  encodeMaximal(context) {
    const buffer = new ZXingStringBuilder();
    let lastCharSize = 0;
    let backtrackStartPosition = context.pos;
    let backtrackBufferLength = 0;
    while (context.hasMoreCharacters()) {
      const c = context.getCurrentChar();
      context.pos++;
      lastCharSize = this.encodeChar(c, buffer);
      if (buffer.length() % 3 === 0) {
        backtrackStartPosition = context.pos;
        backtrackBufferLength = buffer.length();
      }
    }
    if (backtrackBufferLength !== buffer.length()) {
      const unwritten = Math.floor(buffer.length() / 3 * 2);
      const curCodewordCount = Math.floor(
        context.getCodewordCount() + unwritten + 1
      );
      context.updateSymbolInfo(curCodewordCount);
      const available = context.getSymbolInfo().getDataCapacity() - curCodewordCount;
      const rest = Math.floor(buffer.length() % 3);
      if (rest === 2 && available !== 2 || rest === 1 && (lastCharSize > 3 || available !== 1)) {
        context.pos = backtrackStartPosition;
      }
    }
    if (buffer.length() > 0) {
      context.writeCodeword(LATCH_TO_C40);
    }
    this.handleEOD(context, buffer);
  }
  encode(context) {
    const buffer = new ZXingStringBuilder();
    while (context.hasMoreCharacters()) {
      const c = context.getCurrentChar();
      context.pos++;
      let lastCharSize = this.encodeChar(c, buffer);
      const unwritten = Math.floor(buffer.length() / 3) * 2;
      const curCodewordCount = context.getCodewordCount() + unwritten;
      context.updateSymbolInfo(curCodewordCount);
      const available = context.getSymbolInfo().getDataCapacity() - curCodewordCount;
      if (!context.hasMoreCharacters()) {
        const removed = new ZXingStringBuilder();
        if (buffer.length() % 3 === 2 && available !== 2) {
          lastCharSize = this.backtrackOneCharacter(
            context,
            buffer,
            removed,
            lastCharSize
          );
        }
        while (buffer.length() % 3 === 1 && (lastCharSize > 3 || available !== 1)) {
          lastCharSize = this.backtrackOneCharacter(
            context,
            buffer,
            removed,
            lastCharSize
          );
        }
        break;
      }
      const count = buffer.length();
      if (count % 3 === 0) {
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
    this.handleEOD(context, buffer);
  }
  backtrackOneCharacter(context, buffer, removed, lastCharSize) {
    const count = buffer.length();
    const test = buffer.toString().substring(0, count - lastCharSize);
    buffer.setLengthToZero();
    buffer.append(test);
    context.pos--;
    const c = context.getCurrentChar();
    lastCharSize = this.encodeChar(c, removed);
    context.resetSymbolInfo();
    return lastCharSize;
  }
  writeNextTriplet(context, buffer) {
    context.writeCodewords(this.encodeToCodewords(buffer.toString()));
    const test = buffer.toString().substring(3);
    buffer.setLengthToZero();
    buffer.append(test);
  }
  /**
   * Handle "end of data" situations
   *
   * @param context the encoder context
   * @param buffer  the buffer with the remaining encoded characters
   */
  handleEOD(context, buffer) {
    const unwritten = Math.floor(buffer.length() / 3 * 2);
    const rest = buffer.length() % 3;
    const curCodewordCount = context.getCodewordCount() + unwritten;
    context.updateSymbolInfo(curCodewordCount);
    const available = context.getSymbolInfo().getDataCapacity() - curCodewordCount;
    if (rest === 2) {
      buffer.append("\0");
      while (buffer.length() >= 3) {
        this.writeNextTriplet(context, buffer);
      }
      if (context.hasMoreCharacters()) {
        context.writeCodeword(C40_UNLATCH);
      }
    } else if (available === 1 && rest === 1) {
      while (buffer.length() >= 3) {
        this.writeNextTriplet(context, buffer);
      }
      if (context.hasMoreCharacters()) {
        context.writeCodeword(C40_UNLATCH);
      }
      context.pos--;
    } else if (rest === 0) {
      while (buffer.length() >= 3) {
        this.writeNextTriplet(context, buffer);
      }
      if (available > 0 || context.hasMoreCharacters()) {
        context.writeCodeword(C40_UNLATCH);
      }
    } else {
      throw new Error("Unexpected case. Please report!");
    }
    context.signalEncoderChange(ASCII_ENCODATION);
  }
  encodeChar(c, sb) {
    if (c === " ".charCodeAt(0)) {
      sb.append(3);
      return 1;
    }
    if (c >= "0".charCodeAt(0) && c <= "9".charCodeAt(0)) {
      sb.append(c - 48 + 4);
      return 1;
    }
    if (c >= "A".charCodeAt(0) && c <= "Z".charCodeAt(0)) {
      sb.append(c - 65 + 14);
      return 1;
    }
    if (c < " ".charCodeAt(0)) {
      sb.append(0);
      sb.append(c);
      return 2;
    }
    if (c <= "/".charCodeAt(0)) {
      sb.append(1);
      sb.append(c - 33);
      return 2;
    }
    if (c <= "@".charCodeAt(0)) {
      sb.append(1);
      sb.append(c - 58 + 15);
      return 2;
    }
    if (c <= "_".charCodeAt(0)) {
      sb.append(1);
      sb.append(c - 91 + 22);
      return 2;
    }
    if (c <= 127) {
      sb.append(2);
      sb.append(c - 96);
      return 2;
    }
    sb.append(`${1}`);
    let len = 2;
    len += this.encodeChar(c - 128, sb);
    return len;
  }
  encodeToCodewords(sb) {
    const v = 1600 * sb.charCodeAt(0) + 40 * sb.charCodeAt(1) + sb.charCodeAt(2) + 1;
    const cw1 = v / 256;
    const cw2 = v % 256;
    const result = new ZXingStringBuilder();
    result.append(cw1);
    result.append(cw2);
    return result.toString();
  }
}

export { C40Encoder };
//# sourceMappingURL=C40Encoder.js.map
//# sourceMappingURL=C40Encoder.js.map