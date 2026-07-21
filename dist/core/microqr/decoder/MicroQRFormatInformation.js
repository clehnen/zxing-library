import { ZXingInteger } from '../../util/ZXingInteger';

class MicroQRFormatInformation {
  static FORMAT_INFO_MASK_MICRO_QR = 17477;
  /**
   * BCH generator polynomial for Micro QR format info:
   * x^10 + x^8 + x^5 + x^4 + x^2 + x + 1 = 0x537
   */
  static BCH_GENERATOR = 1335;
  /**
   * Pre-computed lookup table: 32 entries, index = 5-bit data, value = masked 15-bit format word.
   * Built at class load time.
   */
  static FORMAT_INFO_DECODE_LOOKUP = MicroQRFormatInformation.buildLookupTable();
  versionIndicator;
  // 0-7 (combined version+EC)
  dataMask;
  // 0-3
  constructor(data5) {
    this.versionIndicator = data5 >> 2 & 7;
    this.dataMask = data5 & 3;
  }
  /**
   * Compute BCH(15,5) parity and return the full 15-bit format word (before XOR mask).
   */
  static computeBCHFormatWord(data5) {
    let d = data5 << 10;
    for (let i = 4; i >= 0; i--) {
      if (d >> i + 10 & 1) {
        d ^= MicroQRFormatInformation.BCH_GENERATOR << i;
      }
    }
    return data5 << 10 | d & 1023;
  }
  /**
   * Build the 32-entry lookup table: [maskedFormatWord, data5] pairs.
   */
  static buildLookupTable() {
    const table = [];
    for (let data5 = 0; data5 < 32; data5++) {
      const formatWord = MicroQRFormatInformation.computeBCHFormatWord(data5);
      const masked = formatWord ^ MicroQRFormatInformation.FORMAT_INFO_MASK_MICRO_QR;
      table.push([masked, data5]);
    }
    return table;
  }
  static numBitsDiffering(a, b) {
    return ZXingInteger.bitCount(a ^ b);
  }
  /**
   * Decode 15 format info bits (as read from the symbol, still masked).
   *
   * @param maskedFormatInfo 15 bits read directly from the symbol (XOR mask not yet removed)
   * @return MicroQRFormatInformation, or null if no match within Hamming distance 3
   */
  static decodeFormatInformation(maskedFormatInfo) {
    for (const [tableEntry, data5] of MicroQRFormatInformation.FORMAT_INFO_DECODE_LOOKUP) {
      if (tableEntry === maskedFormatInfo) {
        return new MicroQRFormatInformation(data5);
      }
    }
    let bestDifference = Number.MAX_SAFE_INTEGER;
    let bestData5 = 0;
    for (const [tableEntry, data5] of MicroQRFormatInformation.FORMAT_INFO_DECODE_LOOKUP) {
      const bitsDiff = MicroQRFormatInformation.numBitsDiffering(maskedFormatInfo, tableEntry);
      if (bitsDiff < bestDifference) {
        bestDifference = bitsDiff;
        bestData5 = data5;
      }
    }
    if (bestDifference <= 3) {
      return new MicroQRFormatInformation(bestData5);
    }
    return null;
  }
  /**
   * Combined version+EC indicator (0-7):
   *   0=M1, 1=M2-L, 2=M2-M, 3=M3-L, 4=M3-M, 5=M4-L, 6=M4-M, 7=M4-Q
   */
  getVersionIndicator() {
    return this.versionIndicator;
  }
  /**
   * Data mask pattern index (0-3).
   */
  getDataMask() {
    return this.dataMask;
  }
  /**
   * Actual version number: 1=M1, 2=M2, 3=M3, 4=M4.
   */
  getMicroQRVersionNumber() {
    if (this.versionIndicator === 0) return 1;
    if (this.versionIndicator <= 2) return 2;
    if (this.versionIndicator <= 4) return 3;
    return 4;
  }
  /** EC level label: 'L', 'M', 'Q', or null for M1. */
  getECLevelLabel() {
    switch (this.versionIndicator) {
      case 0:
        return null;
      // M1, detection only
      case 1:
      case 3:
      case 5:
        return "L";
      case 2:
      case 4:
      case 6:
        return "M";
      case 7:
        return "Q";
      default:
        return null;
    }
  }
}

export { MicroQRFormatInformation };
//# sourceMappingURL=MicroQRFormatInformation.js.map
//# sourceMappingURL=MicroQRFormatInformation.js.map