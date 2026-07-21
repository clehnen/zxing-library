import { StringUtils } from '../../common/StringUtils';
import { char } from '../../../customTypings';
import { ZXingStringBuilder } from '../../util/StringBuilder';
import { C40Encoder } from './C40Encoder';
import { EncoderContext } from './EncoderContext';
import { DataMatrixHighLevelEncoder } from './DataMatrixHighLevelEncoder';
import { X12_ENCODATION, ASCII_ENCODATION, X12_UNLATCH } from './constants';

export class X12Encoder extends C40Encoder {
  public getEncodingMode() {
    return X12_ENCODATION;
  }

  public encode(context: EncoderContext) {
    // step C
    const buffer = new ZXingStringBuilder();
    while (context.hasMoreCharacters()) {
      const c = context.getCurrentChar();
      context.pos++;

      this.encodeChar(c, buffer);

      const count = buffer.length();
      if (count % 3 === 0) {
        this.writeNextTriplet(context, buffer);

        const newMode = DataMatrixHighLevelEncoder.lookAheadTest(
          context.getMessage(),
          context.pos,
          this.getEncodingMode()
        );
        if (newMode !== this.getEncodingMode()) {
          // Return to ASCII encodation, which will actually handle latch to new mode
          context.signalEncoderChange(ASCII_ENCODATION);
          break;
        }
      }
    }
    this.handleEOD(context, buffer);
  }

  encodeChar(c: char, sb: ZXingStringBuilder): number {
    switch (c) {
      case 13: // CR (Carriage return)
        sb.append(0o0);
        break;
      case '*'.charCodeAt(0):
        sb.append(0o1);
        break;
      case '>'.charCodeAt(0):
        sb.append(0o2);
        break;
      case ' '.charCodeAt(0):
        sb.append(0o3);
        break;
      default:
        if (c >= '0'.charCodeAt(0) && c <= '9'.charCodeAt(0)) {
          sb.append(c - 48 + 4);
        } else if (c >= 'A'.charCodeAt(0) && c <= 'Z'.charCodeAt(0)) {
          sb.append(c - 65 + 14);
        } else {
          DataMatrixHighLevelEncoder.illegalCharacter(StringUtils.getCharAt(c));
        }
        break;
    }
    return 1;
  }

  handleEOD(context: EncoderContext, buffer: ZXingStringBuilder) {
    context.updateSymbolInfo();
    const available =
      context.getSymbolInfo().getDataCapacity() - context.getCodewordCount();
    const count = buffer.length();
    context.pos -= count;
    if (
      context.getRemainingCharacters() > 1 ||
      available > 1 ||
      context.getRemainingCharacters() !== available
    ) {
      context.writeCodeword(X12_UNLATCH);
    }
    if (context.getNewEncoding() < 0) {
      context.signalEncoderChange(ASCII_ENCODATION);
    }
  }
}
