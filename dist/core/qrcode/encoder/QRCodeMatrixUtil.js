import { BitArray } from '../../common/BitArray';
import { ZXingInteger } from '../../util/ZXingInteger';
import { QRCodeEncoderQRCode } from './QRCodeEncoderQRCode';
import { QRCodeMaskUtil } from './QRCodeMaskUtil';
import { WriterException } from '../../WriterException';
import { IllegalArgumentException } from '../../IllegalArgumentException';

class QRCodeMatrixUtil {
  constructor() {
  }
  static POSITION_DETECTION_PATTERN = Array.from([
    Int32Array.from([1, 1, 1, 1, 1, 1, 1]),
    Int32Array.from([1, 0, 0, 0, 0, 0, 1]),
    Int32Array.from([1, 0, 1, 1, 1, 0, 1]),
    Int32Array.from([1, 0, 1, 1, 1, 0, 1]),
    Int32Array.from([1, 0, 1, 1, 1, 0, 1]),
    Int32Array.from([1, 0, 0, 0, 0, 0, 1]),
    Int32Array.from([1, 1, 1, 1, 1, 1, 1])
  ]);
  static POSITION_ADJUSTMENT_PATTERN = Array.from([
    Int32Array.from([1, 1, 1, 1, 1]),
    Int32Array.from([1, 0, 0, 0, 1]),
    Int32Array.from([1, 0, 1, 0, 1]),
    Int32Array.from([1, 0, 0, 0, 1]),
    Int32Array.from([1, 1, 1, 1, 1])
  ]);
  // From Appendix E. Table 1, JIS0510X:2004 (71: p). The table was double-checked by komatsu.
  static POSITION_ADJUSTMENT_PATTERN_COORDINATE_TABLE = Array.from([
    Int32Array.from([-1, -1, -1, -1, -1, -1, -1]),
    // Version 1
    Int32Array.from([6, 18, -1, -1, -1, -1, -1]),
    // Version 2
    Int32Array.from([6, 22, -1, -1, -1, -1, -1]),
    // Version 3
    Int32Array.from([6, 26, -1, -1, -1, -1, -1]),
    // Version 4
    Int32Array.from([6, 30, -1, -1, -1, -1, -1]),
    // Version 5
    Int32Array.from([6, 34, -1, -1, -1, -1, -1]),
    // Version 6
    Int32Array.from([6, 22, 38, -1, -1, -1, -1]),
    // Version 7
    Int32Array.from([6, 24, 42, -1, -1, -1, -1]),
    // Version 8
    Int32Array.from([6, 26, 46, -1, -1, -1, -1]),
    // Version 9
    Int32Array.from([6, 28, 50, -1, -1, -1, -1]),
    // Version 10
    Int32Array.from([6, 30, 54, -1, -1, -1, -1]),
    // Version 11
    Int32Array.from([6, 32, 58, -1, -1, -1, -1]),
    // Version 12
    Int32Array.from([6, 34, 62, -1, -1, -1, -1]),
    // Version 13
    Int32Array.from([6, 26, 46, 66, -1, -1, -1]),
    // Version 14
    Int32Array.from([6, 26, 48, 70, -1, -1, -1]),
    // Version 15
    Int32Array.from([6, 26, 50, 74, -1, -1, -1]),
    // Version 16
    Int32Array.from([6, 30, 54, 78, -1, -1, -1]),
    // Version 17
    Int32Array.from([6, 30, 56, 82, -1, -1, -1]),
    // Version 18
    Int32Array.from([6, 30, 58, 86, -1, -1, -1]),
    // Version 19
    Int32Array.from([6, 34, 62, 90, -1, -1, -1]),
    // Version 20
    Int32Array.from([6, 28, 50, 72, 94, -1, -1]),
    // Version 21
    Int32Array.from([6, 26, 50, 74, 98, -1, -1]),
    // Version 22
    Int32Array.from([6, 30, 54, 78, 102, -1, -1]),
    // Version 23
    Int32Array.from([6, 28, 54, 80, 106, -1, -1]),
    // Version 24
    Int32Array.from([6, 32, 58, 84, 110, -1, -1]),
    // Version 25
    Int32Array.from([6, 30, 58, 86, 114, -1, -1]),
    // Version 26
    Int32Array.from([6, 34, 62, 90, 118, -1, -1]),
    // Version 27
    Int32Array.from([6, 26, 50, 74, 98, 122, -1]),
    // Version 28
    Int32Array.from([6, 30, 54, 78, 102, 126, -1]),
    // Version 29
    Int32Array.from([6, 26, 52, 78, 104, 130, -1]),
    // Version 30
    Int32Array.from([6, 30, 56, 82, 108, 134, -1]),
    // Version 31
    Int32Array.from([6, 34, 60, 86, 112, 138, -1]),
    // Version 32
    Int32Array.from([6, 30, 58, 86, 114, 142, -1]),
    // Version 33
    Int32Array.from([6, 34, 62, 90, 118, 146, -1]),
    // Version 34
    Int32Array.from([6, 30, 54, 78, 102, 126, 150]),
    // Version 35
    Int32Array.from([6, 24, 50, 76, 102, 128, 154]),
    // Version 36
    Int32Array.from([6, 28, 54, 80, 106, 132, 158]),
    // Version 37
    Int32Array.from([6, 32, 58, 84, 110, 136, 162]),
    // Version 38
    Int32Array.from([6, 26, 54, 82, 110, 138, 166]),
    // Version 39
    Int32Array.from([6, 30, 58, 86, 114, 142, 170])
    // Version 40
  ]);
  // Type info cells at the left top corner.
  static TYPE_INFO_COORDINATES = Array.from([
    Int32Array.from([8, 0]),
    Int32Array.from([8, 1]),
    Int32Array.from([8, 2]),
    Int32Array.from([8, 3]),
    Int32Array.from([8, 4]),
    Int32Array.from([8, 5]),
    Int32Array.from([8, 7]),
    Int32Array.from([8, 8]),
    Int32Array.from([7, 8]),
    Int32Array.from([5, 8]),
    Int32Array.from([4, 8]),
    Int32Array.from([3, 8]),
    Int32Array.from([2, 8]),
    Int32Array.from([1, 8]),
    Int32Array.from([0, 8])
  ]);
  // From Appendix D in JISX0510:2004 (p. 67)
  static VERSION_INFO_POLY = 7973;
  // 1 1111 0010 0101
  // From Appendix C in JISX0510:2004 (p.65).
  static TYPE_INFO_POLY = 1335;
  static TYPE_INFO_MASK_PATTERN = 21522;
  // Set all cells to -1 (TYPESCRIPTPORT: 255).  -1 (TYPESCRIPTPORT: 255) means that the cell is empty (not set yet).
  //
  // JAVAPORT: We shouldn't need to do this at all. The code should be rewritten to begin encoding
  // with the ByteMatrix initialized all to zero.
  static clearMatrix(matrix) {
    matrix.clear(
      /*(byte) */
      /*-1*/
      255
    );
  }
  // Build 2D matrix of QR Code from "dataBits" with "ecLevel", "version" and "getMaskPattern". On
  // success, store the result in "matrix" and return true.
  static buildMatrix(dataBits, ecLevel, version, maskPattern, matrix) {
    QRCodeMatrixUtil.clearMatrix(matrix);
    QRCodeMatrixUtil.embedBasicPatterns(version, matrix);
    QRCodeMatrixUtil.embedTypeInfo(ecLevel, maskPattern, matrix);
    QRCodeMatrixUtil.maybeEmbedVersionInfo(version, matrix);
    QRCodeMatrixUtil.embedDataBits(dataBits, maskPattern, matrix);
  }
  // Embed basic patterns. On success, modify the matrix and return true.
  // The basic patterns are:
  // - Position detection patterns
  // - Timing patterns
  // - Dark dot at the left bottom corner
  // - Position adjustment patterns, if need be
  static embedBasicPatterns(version, matrix) {
    QRCodeMatrixUtil.embedPositionDetectionPatternsAndSeparators(matrix);
    QRCodeMatrixUtil.embedDarkDotAtLeftBottomCorner(matrix);
    QRCodeMatrixUtil.maybeEmbedPositionAdjustmentPatterns(version, matrix);
    QRCodeMatrixUtil.embedTimingPatterns(matrix);
  }
  // Embed type information. On success, modify the matrix.
  static embedTypeInfo(ecLevel, maskPattern, matrix) {
    const typeInfoBits = new BitArray();
    QRCodeMatrixUtil.makeTypeInfoBits(ecLevel, maskPattern, typeInfoBits);
    for (let i = 0, size = typeInfoBits.getSize(); i < size; ++i) {
      const bit = typeInfoBits.get(typeInfoBits.getSize() - 1 - i);
      const coordinates = QRCodeMatrixUtil.TYPE_INFO_COORDINATES[i];
      const x1 = coordinates[0];
      const y1 = coordinates[1];
      matrix.setBoolean(x1, y1, bit);
      if (i < 8) {
        const x2 = matrix.getWidth() - i - 1;
        const y2 = 8;
        matrix.setBoolean(x2, y2, bit);
      } else {
        const x2 = 8;
        const y2 = matrix.getHeight() - 7 + (i - 8);
        matrix.setBoolean(x2, y2, bit);
      }
    }
  }
  // Embed version information if need be. On success, modify the matrix and return true.
  // See 8.10 of JISX0510:2004 (p.47) for how to embed version information.
  static maybeEmbedVersionInfo(version, matrix) {
    if (version.getVersionNumber() < 7) {
      return;
    }
    const versionInfoBits = new BitArray();
    QRCodeMatrixUtil.makeVersionInfoBits(version, versionInfoBits);
    let bitIndex = 6 * 3 - 1;
    for (let i = 0; i < 6; ++i) {
      for (let j = 0; j < 3; ++j) {
        const bit = versionInfoBits.get(bitIndex);
        bitIndex--;
        matrix.setBoolean(i, matrix.getHeight() - 11 + j, bit);
        matrix.setBoolean(matrix.getHeight() - 11 + j, i, bit);
      }
    }
  }
  // Embed "dataBits" using "getMaskPattern". On success, modify the matrix and return true.
  // For debugging purposes, it skips masking process if "getMaskPattern" is -1(TYPESCRIPTPORT: 255).
  // See 8.7 of JISX0510:2004 (p.38) for how to embed data bits.
  static embedDataBits(dataBits, maskPattern, matrix) {
    let bitIndex = 0;
    let direction = -1;
    let x = matrix.getWidth() - 1;
    let y = matrix.getHeight() - 1;
    while (x > 0) {
      if (x === 6) {
        x -= 1;
      }
      while (y >= 0 && y < matrix.getHeight()) {
        for (let i = 0; i < 2; ++i) {
          const xx = x - i;
          if (!QRCodeMatrixUtil.isEmpty(matrix.get(xx, y))) {
            continue;
          }
          let bit;
          if (bitIndex < dataBits.getSize()) {
            bit = dataBits.get(bitIndex);
            ++bitIndex;
          } else {
            bit = false;
          }
          if (maskPattern !== 255 && QRCodeMaskUtil.getDataMaskBit(maskPattern, xx, y)) {
            bit = !bit;
          }
          matrix.setBoolean(xx, y, bit);
        }
        y += direction;
      }
      direction = -direction;
      y += direction;
      x -= 2;
    }
    if (bitIndex !== dataBits.getSize()) {
      throw new WriterException("Not all bits consumed: " + bitIndex + "/" + dataBits.getSize());
    }
  }
  // Return the position of the most significant bit set (one: to) in the "value". The most
  // significant bit is position 32. If there is no bit set, return 0. Examples:
  // - findMSBSet(0) => 0
  // - findMSBSet(1) => 1
  // - findMSBSet(255) => 8
  static findMSBSet(value) {
    return 32 - ZXingInteger.numberOfLeadingZeros(value);
  }
  // Calculate BCH (Bose-Chaudhuri-Hocquenghem) code for "value" using polynomial "poly". The BCH
  // code is used for encoding type information and version information.
  // Example: Calculation of version information of 7.
  // f(x) is created from 7.
  //   - 7 = 000111 in 6 bits
  //   - f(x) = x^2 + x^1 + x^0
  // g(x) is given by the standard (p. 67)
  //   - g(x) = x^12 + x^11 + x^10 + x^9 + x^8 + x^5 + x^2 + 1
  // Multiply f(x) by x^(18 - 6)
  //   - f'(x) = f(x) * x^(18 - 6)
  //   - f'(x) = x^14 + x^13 + x^12
  // Calculate the remainder of f'(x) / g(x)
  //         x^2
  //         __________________________________________________
  //   g(x) )x^14 + x^13 + x^12
  //         x^14 + x^13 + x^12 + x^11 + x^10 + x^7 + x^4 + x^2
  //         --------------------------------------------------
  //                              x^11 + x^10 + x^7 + x^4 + x^2
  //
  // The remainder is x^11 + x^10 + x^7 + x^4 + x^2
  // Encode it in binary: 110010010100
  // The return value is 0xc94 (1100 1001 0100)
  //
  // Since all coefficients in the polynomials are 1 or 0, we can do the calculation by bit
  // operations. We don't care if coefficients are positive or negative.
  static calculateBCHCode(value, poly) {
    if (poly === 0) {
      throw new IllegalArgumentException("0 polynomial");
    }
    const msbSetInPoly = QRCodeMatrixUtil.findMSBSet(poly);
    value <<= msbSetInPoly - 1;
    while (QRCodeMatrixUtil.findMSBSet(value) >= msbSetInPoly) {
      value ^= poly << QRCodeMatrixUtil.findMSBSet(value) - msbSetInPoly;
    }
    return value;
  }
  // Make bit vector of type information. On success, store the result in "bits" and return true.
  // Encode error correction level and mask pattern. See 8.9 of
  // JISX0510:2004 (p.45) for details.
  static makeTypeInfoBits(ecLevel, maskPattern, bits) {
    if (!QRCodeEncoderQRCode.isValidMaskPattern(maskPattern)) {
      throw new WriterException("Invalid mask pattern");
    }
    const typeInfo = ecLevel.getBits() << 3 | maskPattern;
    bits.appendBits(typeInfo, 5);
    const bchCode = QRCodeMatrixUtil.calculateBCHCode(typeInfo, QRCodeMatrixUtil.TYPE_INFO_POLY);
    bits.appendBits(bchCode, 10);
    const maskBits = new BitArray();
    maskBits.appendBits(QRCodeMatrixUtil.TYPE_INFO_MASK_PATTERN, 15);
    bits.xor(maskBits);
    if (bits.getSize() !== 15) {
      throw new WriterException("should not happen but we got: " + bits.getSize());
    }
  }
  // Make bit vector of version information. On success, store the result in "bits" and return true.
  // See 8.10 of JISX0510:2004 (p.45) for details.
  static makeVersionInfoBits(version, bits) {
    bits.appendBits(version.getVersionNumber(), 6);
    const bchCode = QRCodeMatrixUtil.calculateBCHCode(version.getVersionNumber(), QRCodeMatrixUtil.VERSION_INFO_POLY);
    bits.appendBits(bchCode, 12);
    if (bits.getSize() !== 18) {
      throw new WriterException("should not happen but we got: " + bits.getSize());
    }
  }
  // Check if "value" is empty.
  static isEmpty(value) {
    return value === 255;
  }
  static embedTimingPatterns(matrix) {
    for (let i = 8; i < matrix.getWidth() - 8; ++i) {
      const bit = (i + 1) % 2;
      if (QRCodeMatrixUtil.isEmpty(matrix.get(i, 6))) {
        matrix.setNumber(i, 6, bit);
      }
      if (QRCodeMatrixUtil.isEmpty(matrix.get(6, i))) {
        matrix.setNumber(6, i, bit);
      }
    }
  }
  // Embed the lonely dark dot at left bottom corner. JISX0510:2004 (p.46)
  static embedDarkDotAtLeftBottomCorner(matrix) {
    if (matrix.get(8, matrix.getHeight() - 8) === 0) {
      throw new WriterException();
    }
    matrix.setNumber(8, matrix.getHeight() - 8, 1);
  }
  static embedHorizontalSeparationPattern(xStart, yStart, matrix) {
    for (let x = 0; x < 8; ++x) {
      if (!QRCodeMatrixUtil.isEmpty(matrix.get(xStart + x, yStart))) {
        throw new WriterException();
      }
      matrix.setNumber(xStart + x, yStart, 0);
    }
  }
  static embedVerticalSeparationPattern(xStart, yStart, matrix) {
    for (let y = 0; y < 7; ++y) {
      if (!QRCodeMatrixUtil.isEmpty(matrix.get(xStart, yStart + y))) {
        throw new WriterException();
      }
      matrix.setNumber(xStart, yStart + y, 0);
    }
  }
  static embedPositionAdjustmentPattern(xStart, yStart, matrix) {
    for (let y = 0; y < 5; ++y) {
      const patternY = QRCodeMatrixUtil.POSITION_ADJUSTMENT_PATTERN[y];
      for (let x = 0; x < 5; ++x) {
        matrix.setNumber(xStart + x, yStart + y, patternY[x]);
      }
    }
  }
  static embedPositionDetectionPattern(xStart, yStart, matrix) {
    for (let y = 0; y < 7; ++y) {
      const patternY = QRCodeMatrixUtil.POSITION_DETECTION_PATTERN[y];
      for (let x = 0; x < 7; ++x) {
        matrix.setNumber(xStart + x, yStart + y, patternY[x]);
      }
    }
  }
  // Embed position detection patterns and surrounding vertical/horizontal separators.
  static embedPositionDetectionPatternsAndSeparators(matrix) {
    const pdpWidth = QRCodeMatrixUtil.POSITION_DETECTION_PATTERN[0].length;
    QRCodeMatrixUtil.embedPositionDetectionPattern(0, 0, matrix);
    QRCodeMatrixUtil.embedPositionDetectionPattern(matrix.getWidth() - pdpWidth, 0, matrix);
    QRCodeMatrixUtil.embedPositionDetectionPattern(0, matrix.getWidth() - pdpWidth, matrix);
    const hspWidth = 8;
    QRCodeMatrixUtil.embedHorizontalSeparationPattern(0, hspWidth - 1, matrix);
    QRCodeMatrixUtil.embedHorizontalSeparationPattern(
      matrix.getWidth() - hspWidth,
      hspWidth - 1,
      matrix
    );
    QRCodeMatrixUtil.embedHorizontalSeparationPattern(0, matrix.getWidth() - hspWidth, matrix);
    const vspSize = 7;
    QRCodeMatrixUtil.embedVerticalSeparationPattern(vspSize, 0, matrix);
    QRCodeMatrixUtil.embedVerticalSeparationPattern(matrix.getHeight() - vspSize - 1, 0, matrix);
    QRCodeMatrixUtil.embedVerticalSeparationPattern(
      vspSize,
      matrix.getHeight() - vspSize,
      matrix
    );
  }
  // Embed position adjustment patterns if need be.
  static maybeEmbedPositionAdjustmentPatterns(version, matrix) {
    if (version.getVersionNumber() < 2) {
      return;
    }
    const index = version.getVersionNumber() - 1;
    const coordinates = QRCodeMatrixUtil.POSITION_ADJUSTMENT_PATTERN_COORDINATE_TABLE[index];
    for (let i = 0, length = coordinates.length; i !== length; i++) {
      const y = coordinates[i];
      if (y >= 0) {
        for (let j = 0; j !== length; j++) {
          const x = coordinates[j];
          if (x >= 0 && QRCodeMatrixUtil.isEmpty(matrix.get(x, y))) {
            QRCodeMatrixUtil.embedPositionAdjustmentPattern(x - 2, y - 2, matrix);
          }
        }
      }
    }
  }
}

export { QRCodeMatrixUtil };
//# sourceMappingURL=QRCodeMatrixUtil.js.map
//# sourceMappingURL=QRCodeMatrixUtil.js.map