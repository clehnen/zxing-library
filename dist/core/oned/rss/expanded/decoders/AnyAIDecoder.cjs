'use strict';

var StringBuilder = require('../../../../util/StringBuilder');
var AbstractExpandedDecoder = require('./AbstractExpandedDecoder');

class AnyAIDecoder extends AbstractExpandedDecoder.AbstractExpandedDecoder {
  static HEADER_SIZE = 2 + 1 + 2;
  constructor(information) {
    super(information);
  }
  parseInformation() {
    let buf = new StringBuilder.ZXingStringBuilder();
    return this.getGeneralDecoder().decodeAllCodes(buf, AnyAIDecoder.HEADER_SIZE);
  }
}

exports.AnyAIDecoder = AnyAIDecoder;
//# sourceMappingURL=AnyAIDecoder.cjs.map
//# sourceMappingURL=AnyAIDecoder.cjs.map