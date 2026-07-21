import { FormatException } from '../../FormatException';
import { MicroQRFormatInformation } from './MicroQRFormatInformation';
import { MicroQRVersion } from './MicroQRVersion';
import { MicroQRDataMask } from './MicroQRDataMask';

class MicroQRBitMatrixParser {
  constructor(bitMatrix) {
    this.bitMatrix = bitMatrix;
    const dimension = bitMatrix.getHeight();
    if (dimension < 11 || dimension > 17 || dimension % 2 !== 1) {
      throw new FormatException();
    }
  }
  bitMatrix;
  parsedFormatInfo = null;
  parsedVersion = null;
  /**
   * Read the 15-bit format information from the single format info location.
   *
   * Format info modules (1-indexed in the symbol):
   *   row 8, col 1..8 → bits 14..7 (8 bits)
   *   col 8, row 7..1 → bits 6..0  (7 bits)
   */
  readFormatInformation() {
    if (this.parsedFormatInfo !== null) {
      return this.parsedFormatInfo;
    }
    let formatInfoBits = 0;
    for (let col = 1; col <= 8; col++) {
      formatInfoBits = this.copyBit(col, 8, formatInfoBits);
    }
    for (let row = 7; row >= 1; row--) {
      formatInfoBits = this.copyBit(8, row, formatInfoBits);
    }
    const formatInfo = MicroQRFormatInformation.decodeFormatInformation(formatInfoBits);
    if (formatInfo !== null) {
      this.parsedFormatInfo = formatInfo;
      this.parsedVersion = MicroQRVersion.getVersionForIndicator(formatInfo.getVersionIndicator());
      return formatInfo;
    }
    throw new FormatException();
  }
  copyBit(x, y, bits) {
    return this.bitMatrix.get(x, y) ? bits << 1 | 1 : bits << 1;
  }
  /**
   * Read all codewords from the Micro QR BitMatrix.
   * Applies data mask before reading.
   *
   * For M1 (versionNumber=1) and M3 (versionNumber=3), the last DATA codeword
   * is only 4 bits (half-codeword). The bit stream layout is:
   *   [numDataCodewords-1 full 8-bit data CWs][4-bit half data CW][numECCodewords full 8-bit EC CWs]
   */
  readCodewords() {
    const formatInfo = this.readFormatInformation();
    const version = this.parsedVersion;
    const dataMask = MicroQRDataMask.forIndex(formatInfo.getDataMask());
    const dimension = this.bitMatrix.getHeight();
    dataMask.unmaskBitMatrix(this.bitMatrix, dimension);
    const functionPattern = version.buildFunctionPattern();
    const numDataCodewords = version.getNumDataCodewords();
    const hasHalfCW = version.getVersionNumber() === 1 || version.getVersionNumber() === 3;
    let readingUp = true;
    const result = new Uint8Array(version.getTotalCodewords());
    let resultOffset = 0;
    let currentByte = 0;
    let bitsRead = 0;
    for (let j = dimension - 1; j > 0; j -= 2) {
      for (let count = 0; count < dimension; count++) {
        const i = readingUp ? dimension - 1 - count : count;
        for (let col = 0; col < 2; col++) {
          const x = j - col;
          if (!functionPattern.get(x, i)) {
            bitsRead++;
            currentByte <<= 1;
            if (this.bitMatrix.get(x, i)) {
              currentByte |= 1;
            }
            const isLastDataCW = hasHalfCW && resultOffset === numDataCodewords - 1;
            const cwBits = isLastDataCW ? 4 : 8;
            if (bitsRead === cwBits) {
              result[resultOffset++] = isLastDataCW ? currentByte << 4 & 255 : currentByte & 255;
              bitsRead = 0;
              currentByte = 0;
            }
          }
        }
      }
      readingUp = !readingUp;
    }
    if (resultOffset !== version.getTotalCodewords()) {
      throw new FormatException();
    }
    return result;
  }
}

export { MicroQRBitMatrixParser };
//# sourceMappingURL=MicroQRBitMatrixParser.js.map
//# sourceMappingURL=MicroQRBitMatrixParser.js.map