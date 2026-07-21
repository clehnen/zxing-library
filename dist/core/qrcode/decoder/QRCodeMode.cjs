'use strict';

var IllegalArgumentException = require('../../IllegalArgumentException');

var ModeValues = /* @__PURE__ */ ((ModeValues2) => {
  ModeValues2[ModeValues2["TERMINATOR"] = 0] = "TERMINATOR";
  ModeValues2[ModeValues2["NUMERIC"] = 1] = "NUMERIC";
  ModeValues2[ModeValues2["ALPHANUMERIC"] = 2] = "ALPHANUMERIC";
  ModeValues2[ModeValues2["STRUCTURED_APPEND"] = 3] = "STRUCTURED_APPEND";
  ModeValues2[ModeValues2["BYTE"] = 4] = "BYTE";
  ModeValues2[ModeValues2["ECI"] = 5] = "ECI";
  ModeValues2[ModeValues2["KANJI"] = 6] = "KANJI";
  ModeValues2[ModeValues2["FNC1_FIRST_POSITION"] = 7] = "FNC1_FIRST_POSITION";
  ModeValues2[ModeValues2["FNC1_SECOND_POSITION"] = 8] = "FNC1_SECOND_POSITION";
  ModeValues2[ModeValues2["HANZI"] = 9] = "HANZI";
  return ModeValues2;
})(ModeValues || {});
class QRCodeMode {
  constructor(value, stringValue, characterCountBitsForVersions, bits) {
    this.value = value;
    this.stringValue = stringValue;
    this.characterCountBitsForVersions = characterCountBitsForVersions;
    this.bits = bits;
    QRCodeMode.FOR_BITS.set(bits, this);
    QRCodeMode.FOR_VALUE.set(value, this);
  }
  value;
  stringValue;
  characterCountBitsForVersions;
  bits;
  static FOR_BITS = /* @__PURE__ */ new Map();
  static FOR_VALUE = /* @__PURE__ */ new Map();
  static TERMINATOR = new QRCodeMode(0 /* TERMINATOR */, "TERMINATOR", Int32Array.from([0, 0, 0]), 0);
  // Not really a mode...
  static NUMERIC = new QRCodeMode(1 /* NUMERIC */, "NUMERIC", Int32Array.from([10, 12, 14]), 1);
  static ALPHANUMERIC = new QRCodeMode(2 /* ALPHANUMERIC */, "ALPHANUMERIC", Int32Array.from([9, 11, 13]), 2);
  static STRUCTURED_APPEND = new QRCodeMode(3 /* STRUCTURED_APPEND */, "STRUCTURED_APPEND", Int32Array.from([0, 0, 0]), 3);
  // Not supported
  static BYTE = new QRCodeMode(4 /* BYTE */, "BYTE", Int32Array.from([8, 16, 16]), 4);
  static ECI = new QRCodeMode(5 /* ECI */, "ECI", Int32Array.from([0, 0, 0]), 7);
  // character counts don't apply
  static KANJI = new QRCodeMode(6 /* KANJI */, "KANJI", Int32Array.from([8, 10, 12]), 8);
  static FNC1_FIRST_POSITION = new QRCodeMode(7 /* FNC1_FIRST_POSITION */, "FNC1_FIRST_POSITION", Int32Array.from([0, 0, 0]), 5);
  static FNC1_SECOND_POSITION = new QRCodeMode(8 /* FNC1_SECOND_POSITION */, "FNC1_SECOND_POSITION", Int32Array.from([0, 0, 0]), 9);
  /** See GBT 18284-2000; "Hanzi" is a transliteration of this mode name. */
  static HANZI = new QRCodeMode(9 /* HANZI */, "HANZI", Int32Array.from([8, 10, 12]), 13);
  /**
   * @param bits four bits encoding a QR Code data mode
   * @return Mode encoded by these bits
   * @throws IllegalArgumentException if bits do not correspond to a known mode
   */
  static forBits(bits) {
    const mode = QRCodeMode.FOR_BITS.get(bits);
    if (void 0 === mode) {
      throw new IllegalArgumentException.IllegalArgumentException();
    }
    return mode;
  }
  /**
   * @param version version in question
   * @return number of bits used, in this QR Code symbol {@link QRCodeVersion}, to encode the
   *         count of characters that will follow encoded in this Mode
   */
  getCharacterCountBits(version) {
    const versionNumber = version.getVersionNumber();
    let offset;
    if (versionNumber <= 9) {
      offset = 0;
    } else if (versionNumber <= 26) {
      offset = 1;
    } else {
      offset = 2;
    }
    return this.characterCountBitsForVersions[offset];
  }
  getValue() {
    return this.value;
  }
  getBits() {
    return this.bits;
  }
  equals(o) {
    if (!(o instanceof QRCodeMode)) {
      return false;
    }
    const other = o;
    return this.value === other.value;
  }
  toString() {
    return this.stringValue;
  }
}

exports.ModeValues = ModeValues;
exports.QRCodeMode = QRCodeMode;
//# sourceMappingURL=QRCodeMode.cjs.map
//# sourceMappingURL=QRCodeMode.cjs.map