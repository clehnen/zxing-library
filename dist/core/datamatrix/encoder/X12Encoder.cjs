'use strict';

var StringUtils = require('../../common/StringUtils');
var StringBuilder = require('../../util/StringBuilder');
var C40Encoder = require('./C40Encoder');
var DataMatrixHighLevelEncoder = require('./DataMatrixHighLevelEncoder');
var constants = require('./constants');

class X12Encoder extends C40Encoder.C40Encoder {
  getEncodingMode() {
    return constants.X12_ENCODATION;
  }
  encode(context) {
    const buffer = new StringBuilder.ZXingStringBuilder();
    while (context.hasMoreCharacters()) {
      const c = context.getCurrentChar();
      context.pos++;
      this.encodeChar(c, buffer);
      const count = buffer.length();
      if (count % 3 === 0) {
        this.writeNextTriplet(context, buffer);
        const newMode = DataMatrixHighLevelEncoder.DataMatrixHighLevelEncoder.lookAheadTest(
          context.getMessage(),
          context.pos,
          this.getEncodingMode()
        );
        if (newMode !== this.getEncodingMode()) {
          context.signalEncoderChange(constants.ASCII_ENCODATION);
          break;
        }
      }
    }
    this.handleEOD(context, buffer);
  }
  encodeChar(c, sb) {
    switch (c) {
      case 13:
        sb.append(0);
        break;
      case "*".charCodeAt(0):
        sb.append(1);
        break;
      case ">".charCodeAt(0):
        sb.append(2);
        break;
      case " ".charCodeAt(0):
        sb.append(3);
        break;
      default:
        if (c >= "0".charCodeAt(0) && c <= "9".charCodeAt(0)) {
          sb.append(c - 48 + 4);
        } else if (c >= "A".charCodeAt(0) && c <= "Z".charCodeAt(0)) {
          sb.append(c - 65 + 14);
        } else {
          DataMatrixHighLevelEncoder.DataMatrixHighLevelEncoder.illegalCharacter(StringUtils.StringUtils.getCharAt(c));
        }
        break;
    }
    return 1;
  }
  handleEOD(context, buffer) {
    context.updateSymbolInfo();
    const available = context.getSymbolInfo().getDataCapacity() - context.getCodewordCount();
    const count = buffer.length();
    context.pos -= count;
    if (context.getRemainingCharacters() > 1 || available > 1 || context.getRemainingCharacters() !== available) {
      context.writeCodeword(constants.X12_UNLATCH);
    }
    if (context.getNewEncoding() < 0) {
      context.signalEncoderChange(constants.ASCII_ENCODATION);
    }
  }
}

exports.X12Encoder = X12Encoder;
//# sourceMappingURL=X12Encoder.cjs.map
//# sourceMappingURL=X12Encoder.cjs.map