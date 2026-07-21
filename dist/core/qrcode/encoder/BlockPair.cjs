'use strict';

class BlockPair {
  constructor(dataBytes, errorCorrectionBytes) {
    this.dataBytes = dataBytes;
    this.errorCorrectionBytes = errorCorrectionBytes;
  }
  dataBytes;
  errorCorrectionBytes;
  getDataBytes() {
    return this.dataBytes;
  }
  getErrorCorrectionBytes() {
    return this.errorCorrectionBytes;
  }
}

exports.BlockPair = BlockPair;
//# sourceMappingURL=BlockPair.cjs.map
//# sourceMappingURL=BlockPair.cjs.map