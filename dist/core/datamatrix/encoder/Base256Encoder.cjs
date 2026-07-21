'use strict';

var StringUtils = require('../../common/StringUtils');
var StringBuilder = require('../../util/StringBuilder');
var DataMatrixHighLevelEncoder = require('./DataMatrixHighLevelEncoder');
var constants = require('./constants');

class Base256Encoder {
  getEncodingMode() {
    return constants.BASE256_ENCODATION;
  }
  encode(context) {
    const buffer = new StringBuilder.ZXingStringBuilder();
    buffer.append(0);
    while (context.hasMoreCharacters()) {
      const c = context.getCurrentChar();
      buffer.append(c);
      context.pos++;
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
    const dataCount = buffer.length() - 1;
    const lengthFieldSize = 1;
    const currentSize = context.getCodewordCount() + dataCount + lengthFieldSize;
    context.updateSymbolInfo(currentSize);
    const mustPad = context.getSymbolInfo().getDataCapacity() - currentSize > 0;
    if (context.hasMoreCharacters() || mustPad) {
      if (dataCount <= 249) {
        buffer.setCharAt(0, StringUtils.StringUtils.getCharAt(dataCount));
      } else if (dataCount <= 1555) {
        buffer.setCharAt(
          0,
          StringUtils.StringUtils.getCharAt(Math.floor(dataCount / 250) + 249)
        );
        buffer.insert(1, StringUtils.StringUtils.getCharAt(dataCount % 250));
      } else {
        throw new Error("Message length not in valid ranges: " + dataCount);
      }
    }
    for (let i = 0, c = buffer.length(); i < c; i++) {
      context.writeCodeword(
        this.randomize255State(
          buffer.charAt(i).charCodeAt(0),
          context.getCodewordCount() + 1
        )
      );
    }
  }
  randomize255State(ch, codewordPosition) {
    const pseudoRandom = 149 * codewordPosition % 255 + 1;
    const tempVariable = ch + pseudoRandom;
    if (tempVariable <= 255) {
      return tempVariable;
    } else {
      return tempVariable - 256;
    }
  }
}

exports.Base256Encoder = Base256Encoder;
//# sourceMappingURL=Base256Encoder.cjs.map
//# sourceMappingURL=Base256Encoder.cjs.map