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

export { BlockPair };
//# sourceMappingURL=BlockPair.js.map
//# sourceMappingURL=BlockPair.js.map