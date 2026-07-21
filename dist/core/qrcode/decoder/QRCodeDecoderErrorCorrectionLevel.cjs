'use strict';

var ArgumentException = require('../../ArgumentException');
var IllegalArgumentException = require('../../IllegalArgumentException');

var ErrorCorrectionLevelValues = /* @__PURE__ */ ((ErrorCorrectionLevelValues2) => {
  ErrorCorrectionLevelValues2[ErrorCorrectionLevelValues2["L"] = 0] = "L";
  ErrorCorrectionLevelValues2[ErrorCorrectionLevelValues2["M"] = 1] = "M";
  ErrorCorrectionLevelValues2[ErrorCorrectionLevelValues2["Q"] = 2] = "Q";
  ErrorCorrectionLevelValues2[ErrorCorrectionLevelValues2["H"] = 3] = "H";
  return ErrorCorrectionLevelValues2;
})(ErrorCorrectionLevelValues || {});
class QRCodeDecoderErrorCorrectionLevel {
  constructor(value, stringValue, bits) {
    this.value = value;
    this.stringValue = stringValue;
    this.bits = bits;
    QRCodeDecoderErrorCorrectionLevel.FOR_BITS.set(bits, this);
    QRCodeDecoderErrorCorrectionLevel.FOR_VALUE.set(value, this);
  }
  value;
  stringValue;
  bits;
  static FOR_BITS = /* @__PURE__ */ new Map();
  static FOR_VALUE = /* @__PURE__ */ new Map();
  /** L = ~7% correction */
  static L = new QRCodeDecoderErrorCorrectionLevel(0 /* L */, "L", 1);
  /** M = ~15% correction */
  static M = new QRCodeDecoderErrorCorrectionLevel(1 /* M */, "M", 0);
  /** Q = ~25% correction */
  static Q = new QRCodeDecoderErrorCorrectionLevel(2 /* Q */, "Q", 3);
  /** H = ~30% correction */
  static H = new QRCodeDecoderErrorCorrectionLevel(3 /* H */, "H", 2);
  getValue() {
    return this.value;
  }
  getBits() {
    return this.bits;
  }
  static fromString(s) {
    switch (s) {
      case "L":
        return QRCodeDecoderErrorCorrectionLevel.L;
      case "M":
        return QRCodeDecoderErrorCorrectionLevel.M;
      case "Q":
        return QRCodeDecoderErrorCorrectionLevel.Q;
      case "H":
        return QRCodeDecoderErrorCorrectionLevel.H;
      default:
        throw new ArgumentException.ArgumentException(s + "not available");
    }
  }
  toString() {
    return this.stringValue;
  }
  equals(o) {
    if (!(o instanceof QRCodeDecoderErrorCorrectionLevel)) {
      return false;
    }
    const other = o;
    return this.value === other.value;
  }
  /**
   * @param bits int containing the two bits encoding a QR Code's error correction level
   * @return ErrorCorrectionLevel representing the encoded error correction level
   */
  static forBits(bits) {
    if (bits < 0 || bits >= QRCodeDecoderErrorCorrectionLevel.FOR_BITS.size) {
      throw new IllegalArgumentException.IllegalArgumentException();
    }
    return QRCodeDecoderErrorCorrectionLevel.FOR_BITS.get(bits);
  }
}

exports.ErrorCorrectionLevelValues = ErrorCorrectionLevelValues;
exports.QRCodeDecoderErrorCorrectionLevel = QRCodeDecoderErrorCorrectionLevel;
//# sourceMappingURL=QRCodeDecoderErrorCorrectionLevel.cjs.map
//# sourceMappingURL=QRCodeDecoderErrorCorrectionLevel.cjs.map