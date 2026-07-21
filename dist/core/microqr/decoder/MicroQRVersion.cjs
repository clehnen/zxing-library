'use strict';

var BitMatrix = require('../../common/BitMatrix');
var ECBlocks = require('../../qrcode/decoder/ECBlocks');
var ECB = require('../../qrcode/decoder/ECB');
var FormatException = require('../../FormatException');

class MicroQRVersion {
  constructor(versionNumber, versionIndicator, ecBlocks) {
    this.versionNumber = versionNumber;
    this.versionIndicator = versionIndicator;
    this.ecBlocks = ecBlocks;
    const ec = ecBlocks;
    const ecb = ec.getECBlocks()[0];
    this.totalCodewords = ecb.getCount() * (ecb.getDataCodewords() + ec.getECCodewordsPerBlock());
  }
  versionNumber;
  versionIndicator;
  ecBlocks;
  /** Maps versionIndicator (0-7) to [versionNumber, ecLevelLabel] */
  static VERSION_INFO = [
    [1, null],
    // 0: M1, no EC
    [2, "L"],
    // 1: M2-L
    [2, "M"],
    // 2: M2-M
    [3, "L"],
    // 3: M3-L
    [3, "M"],
    // 4: M3-M
    [4, "L"],
    // 5: M4-L
    [4, "M"],
    // 6: M4-M
    [4, "Q"]
    // 7: M4-Q
  ];
  /**
   * ECBlocks indexed by versionIndicator (0-7).
   * ECBlocks(ecCodewordsPerBlock, ECB(count, dataCodewords))
   * Total codewords = ecCodewordsPerBlock*count + count*dataCodewords
   *
   * From ISO 18004:2006, Table E.1:
   *   M1:   3 data + 2 EC = 5 total
   *   M2-L: 5 data + 5 EC = 10 total
   *   M2-M: 4 data + 6 EC = 10 total
   *   M3-L: 11 data + 6 EC = 17 total
   *   M3-M: 9 data + 8 EC = 17 total
   *   M4-L: 16 data + 8 EC = 24 total
   *   M4-M: 14 data + 10 EC = 24 total
   *   M4-Q: 10 data + 14 EC = 24 total
   */
  static EC_BLOCKS = [
    new ECBlocks.ECBlocks(2, new ECB.ECB(1, 3)),
    // 0: M1
    new ECBlocks.ECBlocks(5, new ECB.ECB(1, 5)),
    // 1: M2-L
    new ECBlocks.ECBlocks(6, new ECB.ECB(1, 4)),
    // 2: M2-M
    new ECBlocks.ECBlocks(6, new ECB.ECB(1, 11)),
    // 3: M3-L
    new ECBlocks.ECBlocks(8, new ECB.ECB(1, 9)),
    // 4: M3-M
    new ECBlocks.ECBlocks(8, new ECB.ECB(1, 16)),
    // 5: M4-L
    new ECBlocks.ECBlocks(10, new ECB.ECB(1, 14)),
    // 6: M4-M
    new ECBlocks.ECBlocks(14, new ECB.ECB(1, 10))
    // 7: M4-Q
  ];
  /**
   * Number of mode indicator bits for versions M1-M4.
   * M1: 0 (only Numeric), M2: 1, M3: 2, M4: 3.
   */
  static MODE_INDICATOR_BITS = [0, 1, 2, 3];
  totalCodewords;
  getVersionNumber() {
    return this.versionNumber;
  }
  /** Combined version+EC indicator (0-7). */
  getVersionIndicator() {
    return this.versionIndicator;
  }
  /** Dimension of the symbol: 9 + 2*versionNumber. */
  getDimensionForVersion() {
    return 9 + 2 * this.versionNumber;
  }
  getTotalCodewords() {
    return this.totalCodewords;
  }
  getNumDataCodewords() {
    return this.ecBlocks.getECBlocks()[0].getDataCodewords();
  }
  getNumECCodewords() {
    return this.totalCodewords - this.getNumDataCodewords();
  }
  getECBlocks() {
    return this.ecBlocks;
  }
  /** EC level label: 'L', 'M', 'Q', or null for M1. */
  getECLevelLabel() {
    return MicroQRVersion.VERSION_INFO[this.versionIndicator][1];
  }
  /** Number of mode indicator bits (0 for M1, 1 for M2, 2 for M3, 3 for M4). */
  getModeIndicatorBits() {
    return MicroQRVersion.MODE_INDICATOR_BITS[this.versionNumber - 1];
  }
  /**
   * Build the function pattern BitMatrix for this version.
   * Marks: 9×9 upper-left area (finder + separator + format info),
   * and timing strips on row 0 (cols 9+) and col 0 (rows 9+).
   */
  buildFunctionPattern() {
    const dimension = this.getDimensionForVersion();
    const bitMatrix = new BitMatrix.BitMatrix(dimension);
    bitMatrix.setRegion(0, 0, 9, 9);
    if (dimension > 9) {
      bitMatrix.setRegion(9, 0, dimension - 9, 1);
      bitMatrix.setRegion(0, 9, 1, dimension - 9);
    }
    return bitMatrix;
  }
  /**
   * Get a MicroQRVersion by its version indicator (0-7).
   */
  static getVersionForIndicator(versionIndicator) {
    if (versionIndicator < 0 || versionIndicator > 7) {
      throw new FormatException.FormatException();
    }
    const [versionNumber] = MicroQRVersion.VERSION_INFO[versionIndicator];
    return new MicroQRVersion(versionNumber, versionIndicator, MicroQRVersion.EC_BLOCKS[versionIndicator]);
  }
  /**
   * Get a MicroQRVersion from the symbol dimension (11, 13, 15, or 17).
   * Returns version M1-M4; EC level unknown (use version indicator 0 for each).
   */
  static getVersionForDimension(dimension) {
    switch (dimension) {
      case 11:
        return MicroQRVersion.getVersionForIndicator(0);
      // M1
      case 13:
        return MicroQRVersion.getVersionForIndicator(1);
      // M2-L (placeholder)
      case 15:
        return MicroQRVersion.getVersionForIndicator(3);
      // M3-L (placeholder)
      case 17:
        return MicroQRVersion.getVersionForIndicator(5);
      // M4-L (placeholder)
      default:
        throw new FormatException.FormatException();
    }
  }
  toString() {
    return "M" + this.versionNumber;
  }
}

exports.MicroQRVersion = MicroQRVersion;
//# sourceMappingURL=MicroQRVersion.cjs.map
//# sourceMappingURL=MicroQRVersion.cjs.map