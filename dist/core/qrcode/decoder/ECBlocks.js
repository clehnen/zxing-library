class ECBlocks {
  constructor(ecCodewordsPerBlock, ...ecBlocks) {
    this.ecCodewordsPerBlock = ecCodewordsPerBlock;
    this.ecBlocks = ecBlocks;
  }
  ecCodewordsPerBlock;
  ecBlocks;
  getECCodewordsPerBlock() {
    return this.ecCodewordsPerBlock;
  }
  getNumBlocks() {
    let total = 0;
    const ecBlocks = this.ecBlocks;
    for (const ecBlock of ecBlocks) {
      total += ecBlock.getCount();
    }
    return total;
  }
  getTotalECCodewords() {
    return this.ecCodewordsPerBlock * this.getNumBlocks();
  }
  getECBlocks() {
    return this.ecBlocks;
  }
}

export { ECBlocks };
//# sourceMappingURL=ECBlocks.js.map
//# sourceMappingURL=ECBlocks.js.map