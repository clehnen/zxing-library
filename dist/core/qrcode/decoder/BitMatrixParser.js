import { QRCodeVersion } from './QRCodeVersion';
import { QRCodeDecoderFormatInformation } from './QRCodeDecoderFormatInformation';
import { QRCodeDataMask } from './QRCodeDataMask';
import { FormatException } from '../../FormatException';

class BitMatrixParser {
  bitMatrix;
  parsedVersion;
  parsedFormatInfo;
  isMirror;
  /**
   * @param bitMatrix {@link BitMatrix} to parse
   * @throws FormatException if dimension is not >= 21 and 1 mod 4
   */
  constructor(bitMatrix) {
    const dimension = bitMatrix.getHeight();
    if (dimension < 21 || (dimension & 3) !== 1) {
      throw new FormatException();
    }
    this.bitMatrix = bitMatrix;
  }
  /**
   * <p>Reads format information from one of its two locations within the QR Code.</p>
   *
   * @return {@link QRCodeDecoderFormatInformation} encapsulating the QR Code's format info
   * @throws FormatException if both format information locations cannot be parsed as
   * the valid encoding of format information
   */
  readFormatInformation() {
    if (this.parsedFormatInfo !== null && this.parsedFormatInfo !== void 0) {
      return this.parsedFormatInfo;
    }
    let formatInfoBits1 = 0;
    for (let i = 0; i < 6; i++) {
      formatInfoBits1 = this.copyBit(i, 8, formatInfoBits1);
    }
    formatInfoBits1 = this.copyBit(7, 8, formatInfoBits1);
    formatInfoBits1 = this.copyBit(8, 8, formatInfoBits1);
    formatInfoBits1 = this.copyBit(8, 7, formatInfoBits1);
    for (let j = 5; j >= 0; j--) {
      formatInfoBits1 = this.copyBit(8, j, formatInfoBits1);
    }
    const dimension = this.bitMatrix.getHeight();
    let formatInfoBits2 = 0;
    const jMin = dimension - 7;
    for (let j = dimension - 1; j >= jMin; j--) {
      formatInfoBits2 = this.copyBit(8, j, formatInfoBits2);
    }
    for (let i = dimension - 8; i < dimension; i++) {
      formatInfoBits2 = this.copyBit(i, 8, formatInfoBits2);
    }
    this.parsedFormatInfo = QRCodeDecoderFormatInformation.decodeFormatInformation(formatInfoBits1, formatInfoBits2);
    if (this.parsedFormatInfo !== null) {
      return this.parsedFormatInfo;
    }
    throw new FormatException();
  }
  /**
   * <p>Reads version information from one of its two locations within the QR Code.</p>
   *
   * @return {@link QRCodeVersion} encapsulating the QR Code's version
   * @throws FormatException if both version information locations cannot be parsed as
   * the valid encoding of version information
   */
  readVersion() {
    if (this.parsedVersion !== null && this.parsedVersion !== void 0) {
      return this.parsedVersion;
    }
    const dimension = this.bitMatrix.getHeight();
    const provisionalVersion = Math.floor((dimension - 17) / 4);
    if (provisionalVersion <= 6) {
      return QRCodeVersion.getVersionForNumber(provisionalVersion);
    }
    let versionBits = 0;
    const ijMin = dimension - 11;
    for (let j = 5; j >= 0; j--) {
      for (let i = dimension - 9; i >= ijMin; i--) {
        versionBits = this.copyBit(i, j, versionBits);
      }
    }
    let theParsedVersion = QRCodeVersion.decodeVersionInformation(versionBits);
    if (theParsedVersion !== null && theParsedVersion.getDimensionForVersion() === dimension) {
      this.parsedVersion = theParsedVersion;
      return theParsedVersion;
    }
    versionBits = 0;
    for (let i = 5; i >= 0; i--) {
      for (let j = dimension - 9; j >= ijMin; j--) {
        versionBits = this.copyBit(i, j, versionBits);
      }
    }
    theParsedVersion = QRCodeVersion.decodeVersionInformation(versionBits);
    if (theParsedVersion !== null && theParsedVersion.getDimensionForVersion() === dimension) {
      this.parsedVersion = theParsedVersion;
      return theParsedVersion;
    }
    throw new FormatException();
  }
  copyBit(i, j, versionBits) {
    const bit = this.isMirror ? this.bitMatrix.get(j, i) : this.bitMatrix.get(i, j);
    return bit ? versionBits << 1 | 1 : versionBits << 1;
  }
  /**
   * <p>Reads the bits in the {@link BitMatrix} representing the finder pattern in the
   * correct order in order to reconstruct the codewords bytes contained within the
   * QR Code.</p>
   *
   * @return bytes encoded within the QR Code
   * @throws FormatException if the exact number of bytes expected is not read
   */
  readCodewords() {
    const formatInfo = this.readFormatInformation();
    const version = this.readVersion();
    const dataMask = QRCodeDataMask.values.get(formatInfo.getDataMask());
    const dimension = this.bitMatrix.getHeight();
    dataMask.unmaskBitMatrix(this.bitMatrix, dimension);
    const functionPattern = version.buildFunctionPattern();
    let readingUp = true;
    const result = new Uint8Array(version.getTotalCodewords());
    let resultOffset = 0;
    let currentByte = 0;
    let bitsRead = 0;
    for (let j = dimension - 1; j > 0; j -= 2) {
      if (j === 6) {
        j--;
      }
      for (let count = 0; count < dimension; count++) {
        const i = readingUp ? dimension - 1 - count : count;
        for (let col = 0; col < 2; col++) {
          if (!functionPattern.get(j - col, i)) {
            bitsRead++;
            currentByte <<= 1;
            if (this.bitMatrix.get(j - col, i)) {
              currentByte |= 1;
            }
            if (bitsRead === 8) {
              result[resultOffset++] = /*(byte) */
              currentByte;
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
  /**
   * Revert the mask removal done while reading the code words. The bit matrix should revert to its original state.
   */
  remask() {
    if (this.parsedFormatInfo === null) {
      return;
    }
    const dataMask = QRCodeDataMask.values.get(this.parsedFormatInfo.getDataMask());
    const dimension = this.bitMatrix.getHeight();
    dataMask.unmaskBitMatrix(this.bitMatrix, dimension);
  }
  /**
   * Prepare the parser for a mirrored operation.
   * This flag has effect only on the {@link #readFormatInformation()} and the
   * {@link #readVersion()}. Before proceeding with {@link #readCodewords()} the
   * {@link #mirror()} method should be called.
   *
   * @param mirror Whether to read version and format information mirrored.
   */
  setMirror(isMirror) {
    this.parsedVersion = null;
    this.parsedFormatInfo = null;
    this.isMirror = isMirror;
  }
  /** Mirror the bit matrix in order to attempt a second reading. */
  mirror() {
    const bitMatrix = this.bitMatrix;
    for (let x = 0, width = bitMatrix.getWidth(); x < width; x++) {
      for (let y = x + 1, height = bitMatrix.getHeight(); y < height; y++) {
        if (bitMatrix.get(x, y) !== bitMatrix.get(y, x)) {
          bitMatrix.flip(y, x);
          bitMatrix.flip(x, y);
        }
      }
    }
  }
}

export { BitMatrixParser };
//# sourceMappingURL=BitMatrixParser.js.map
//# sourceMappingURL=BitMatrixParser.js.map