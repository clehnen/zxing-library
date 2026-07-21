import { IllegalArgumentException } from '../../IllegalArgumentException';

class DataBlock {
  constructor(numDataCodewords, codewords) {
    this.numDataCodewords = numDataCodewords;
    this.codewords = codewords;
  }
  numDataCodewords;
  codewords;
  /**
   * <p>When QR Codes use multiple data blocks, they are actually interleaved.
   * That is, the first byte of data block 1 to n is written, then the second bytes, and so on. This
   * method will separate the data into original blocks.</p>
   *
   * @param rawCodewords bytes as read directly from the QR Code
   * @param version version of the QR Code
   * @param ecLevel error-correction level of the QR Code
   * @return DataBlocks containing original bytes, "de-interleaved" from representation in the
   *         QR Code
   */
  static getDataBlocks(rawCodewords, version, ecLevel) {
    if (rawCodewords.length !== version.getTotalCodewords()) {
      throw new IllegalArgumentException();
    }
    const ecBlocks = version.getECBlocksForLevel(ecLevel);
    let totalBlocks = 0;
    const ecBlockArray = ecBlocks.getECBlocks();
    for (const ecBlock of ecBlockArray) {
      totalBlocks += ecBlock.getCount();
    }
    const result = new Array(totalBlocks);
    let numResultBlocks = 0;
    for (const ecBlock of ecBlockArray) {
      for (let i = 0; i < ecBlock.getCount(); i++) {
        const numDataCodewords = ecBlock.getDataCodewords();
        const numBlockCodewords = ecBlocks.getECCodewordsPerBlock() + numDataCodewords;
        result[numResultBlocks++] = new DataBlock(numDataCodewords, new Uint8Array(numBlockCodewords));
      }
    }
    const shorterBlocksTotalCodewords = result[0].codewords.length;
    let longerBlocksStartAt = result.length - 1;
    while (longerBlocksStartAt >= 0) {
      const numCodewords = result[longerBlocksStartAt].codewords.length;
      if (numCodewords === shorterBlocksTotalCodewords) {
        break;
      }
      longerBlocksStartAt--;
    }
    longerBlocksStartAt++;
    const shorterBlocksNumDataCodewords = shorterBlocksTotalCodewords - ecBlocks.getECCodewordsPerBlock();
    let rawCodewordsOffset = 0;
    for (let i = 0; i < shorterBlocksNumDataCodewords; i++) {
      for (let j = 0; j < numResultBlocks; j++) {
        result[j].codewords[i] = rawCodewords[rawCodewordsOffset++];
      }
    }
    for (let j = longerBlocksStartAt; j < numResultBlocks; j++) {
      result[j].codewords[shorterBlocksNumDataCodewords] = rawCodewords[rawCodewordsOffset++];
    }
    const max = result[0].codewords.length;
    for (let i = shorterBlocksNumDataCodewords; i < max; i++) {
      for (let j = 0; j < numResultBlocks; j++) {
        const iOffset = j < longerBlocksStartAt ? i : i + 1;
        result[j].codewords[iOffset] = rawCodewords[rawCodewordsOffset++];
      }
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