'use strict';

var AI013x0xDecoder = require('./AI013x0xDecoder');

class AI01320xDecoder extends AI013x0xDecoder.AI013x0xDecoder {
  constructor(information) {
    super(information);
  }
  addWeightCode(buf, weight) {
    if (weight < 1e4) {
      buf.append("(3202)");
    } else {
      buf.append("(3203)");
    }
  }
  checkWeight(weight) {
    if (weight < 1e4) {
      return weight;
    }
    return weight - 1e4;
  }
}

exports.AI01320xDecoder = AI01320xDecoder;
//# sourceMappingURL=AI01320xDecoder.cjs.map
//# sourceMappingURL=AI01320xDecoder.cjs.map