import { IllegalArgumentException } from '../../IllegalArgumentException';

class DataBlock {
  numDataCodewords;
  codewords;
  constructor(numDataCodewords, codewords) {
    this.numDataCodewords = numDataCodewords;
    this.codewords = codewords;
  }
  /**
   * <p>When Data Matrix Codes use multiple data blocks, they actually interleave the bytes of each of them.
   * That is, the first byte of data block 1 to n is written, then the second bytes, and so on. This
   * method will separate the data into original blocks.</p>
   *
   * @param rawCodewords bytes as read directly from the Data Matrix Code
   * @param version version of the Data Matrix Code
   * @return DataBlocks containing original bytes, "de-interleaved" from representation in the
   *         Data Matrix Code
   */
  static getDataBlocks(rawCodewords, version) {
    const ecBlocks = version.getECBlocks();
    let totalBlocks = 0;
    const ecBlockArray = ecBlocks.getECBlocks();
    for (let ecBlock of ecBlockArray) {
      totalBlocks += ecBlock.getCount();
    }
    const result = new Array(totalBlocks);
    let numResultBlocks = 0;
    for (let ecBlock of ecBlockArray) {
      for (let i = 0; i < ecBlock.getCount(); i++) {
        const numDataCodewords = ecBlock.getDataCodewords();
        const numBlockCodewords = ecBlocks.getECCodewords() + numDataCodewords;
        result[numResultBlocks++] = new DataBlock(numDataCodewords, new Uint8Array(numBlockCodewords));
      }
    }
    const longerBlocksTotalCodewords = result[0].codewords.length;
    const longerBlocksNumDataCodewords = longerBlocksTotalCodewords - ecBlocks.getECCodewords();
    const shorterBlocksNumDataCodewords = longerBlocksNumDataCodewords - 1;
    let rawCodewordsOffset = 0;
    for (let i = 0; i < shorterBlocksNumDataCodewords; i++) {
      for (let j = 0; j < numResultBlocks; j++) {
        result[j].codewords[i] = rawCodewords[rawCodewordsOffset++];
      }
    }
    const specialVersion = version.getVersionNumber() === 24;
    const numLongerBlocks = specialVersion ? 8 : numResultBlocks;
    for (let j = 0; j < numLongerBlocks; j++) {
      result[j].codewords[longerBlocksNumDataCodewords - 1] = rawCodewords[rawCodewordsOffset++];
    }
    const max = result[0].codewords.length;
    for (let i = longerBlocksNumDataCodewords; i < max; i++) {
      for (let j = 0; j < numResultBlocks; j++) {
        const jOffset = specialVersion ? (j + 8) % numResultBlocks : j;
        const iOffset = specialVersion && jOffset > 7 ? i - 1 : i;
        result[jOffset].codewords[iOffset] = rawCodewords[rawCodewordsOffset++];
      }
    }
    if (rawCodewordsOffset !== rawCodewords.length) {
      throw new IllegalArgumentException();
    }
    return result;
  }
  getNumDataCodewords() {
    return this.numDataCodewords;
  }
  getCodewords() {
    return this.codewords;
  }
}

export { DataBlock };
//# sourceMappingURL=DataBlock.js.map
//# sourceMappingURL=DataBlock.js.map