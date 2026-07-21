import { ZXingStringBuilder } from '../../util/StringBuilder';

class QRCodeEncoderQRCode {
  static NUM_MASK_PATTERNS = 8;
  mode;
  ecLevel;
  version;
  maskPattern;
  /*int*/
  matrix;
  constructor() {
    this.maskPattern = -1;
  }
  getMode() {
    return this.mode;
  }
  getECLevel() {
    return this.ecLevel;
  }
  getVersion() {
    return this.version;
  }
  getMaskPattern() {
    return this.maskPattern;
  }
  getMatrix() {
    return this.matrix;
  }
  /*@Override*/
  toString() {
    const result = new ZXingStringBuilder();
    result.append("<<\n");
    result.append(" mode: ");
    result.append(this.mode ? this.mode.toString() : "null");
    result.append("\n ecLevel: ");
    result.append(this.ecLevel ? this.ecLevel.toString() : "null");
    result.append("\n version: ");
    result.append(this.version ? this.version.toString() : "null");
    result.append("\n maskPattern: ");
    result.append(this.maskPattern.toString());
    if (this.matrix) {
      result.append("\n matrix:\n");
      result.append(this.matrix.toString());
    } else {
      result.append("\n matrix: null\n");
    }
    result.append(">>\n");
    return result.toString();
  }
  setMode(value) {
    this.mode = value;
  }
  setECLevel(value) {
    this.ecLevel = value;
  }
  setVersion(version) {
    this.version = version;
  }
  setMaskPattern(value) {
    this.maskPattern = value;
  }
  setMatrix(value) {
    this.matrix = value;
  }
  // Check if "mask_pattern" is valid.
  static isValidMaskPattern(maskPattern) {
    return maskPattern >= 0 && maskPattern < QRCodeEncoderQRCode.NUM_MASK_PATTERNS;
  }
}

export { QRCodeEncoderQRCode };
//# sourceMappingURL=QRCodeEncoderQRCode.js.map
//# sourceMappingURL=QRCodeEncoderQRCode.js.map