'use strict';

var AI013x0xDecoder = require('./AI013x0xDecoder');

class AI013103decoder extends AI013x0xDecoder.AI013x0xDecoder {
  constructor(information) {
    super(information);
  }
  addWeightCode(buf, weight) {
    buf.append("(3103)");
  }
  checkWeight(weight) {
    return weight;
  }
}

exports.AI013103decoder = AI013103decoder;
//# sourceMappingURL=AI013103decoder.cjs.map
//# sourceMappingURL=AI013103decoder.cjs.map