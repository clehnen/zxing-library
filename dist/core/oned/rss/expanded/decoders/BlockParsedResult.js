class BlockParsedResult {
  decodedInformation;
  finished;
  constructor(decodedInformation, finished) {
    this.decodedInformation = decodedInformation ? decodedInformation : null;
    this.finished = !!finished;
  }
  getDecodedInformation() {
    return this.decodedInformation;
  }
  isFinished() {
    return this.finished;
  }
}

export { BlockParsedResult };
//# sourceMappingURL=BlockParsedResult.js.map
//# sourceMappingURL=BlockParsedResult.js.map