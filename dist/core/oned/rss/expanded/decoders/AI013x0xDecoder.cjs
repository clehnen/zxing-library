'use strict';

var AI01weightDecoder = require('./AI01weightDecoder');
var StringBuilder = require('../../../../util/StringBuilder');
var NotFoundException = require('../../../../NotFoundException');

class AI013x0xDecoder extends AI01weightDecoder.AI01weightDecoder {
  static HEADER_SIZE = 4 + 1;
  static WEIGHT_SIZE = 15;
  constructor(information) {
    super(information);
  }
  parseInformation() {
    if (this.getInformation().getSize() !== AI013x0xDecoder.HEADER_SIZE + AI01weightDecoder.AI01weightDecoder.GTIN_SIZE + AI013x0xDecoder.WEIGHT_SIZE) {
      throw new NotFoundException.NotFoundException();
    }
    let buf = new StringBuilder.ZXingStringBuilder();
    this.encodeCompressedGtin(buf, AI013x0xDecoder.HEADER_SIZE);
    this.encodeCompressedWeight(
      buf,
      AI013x0xDecoder.HEADER_SIZE + AI01weightDecoder.AI01weightDecoder.GTIN_SIZE,
      AI013x0xDecoder.WEIGHT_SIZE
    );
    return buf.toString();
  }
}

exports.AI013x0xDecoder = AI013x0xDecoder;
//# sourceMappingURL=AI013x0xDecoder.cjs.map
//# sourceMappingURL=AI013x0xDecoder.cjs.map