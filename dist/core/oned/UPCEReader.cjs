'use strict';

var UPCEANReader = require('./UPCEANReader');
var StringBuilder = require('../util/StringBuilder');
var NotFoundException = require('../NotFoundException');
var BarcodeFormat = require('../BarcodeFormat');

class UPCEReader extends UPCEANReader.UPCEANReader {
  /**
   * The pattern that marks the middle, and end, of a UPC-E pattern.
   * There is no "second half" to a UPC-E barcode.
   */
  static MIDDLE_END_PATTERN = Int32Array.from([1, 1, 1, 1, 1, 1]);
  // For an UPC-E barcode, the final digit is represented by the parities used
  // to encode the middle six digits, according to the table below.
  //
  //                Parity of next 6 digits
  //    Digit   0     1     2     3     4     5
  //       0    Even   Even  Even Odd  Odd   Odd
  //       1    Even   Even  Odd  Even Odd   Odd
  //       2    Even   Even  Odd  Odd  Even  Odd
  //       3    Even   Even  Odd  Odd  Odd   Even
  //       4    Even   Odd   Even Even Odd   Odd
  //       5    Even   Odd   Odd  Even Even  Odd
  //       6    Even   Odd   Odd  Odd  Even  Even
  //       7    Even   Odd   Even Odd  Even  Odd
  //       8    Even   Odd   Even Odd  Odd   Even
  //       9    Even   Odd   Odd  Even Odd   Even
  //
  // The encoding is represented by the following array, which is a bit pattern
  // using Odd = 0 and Even = 1. For example, 5 is represented by:
  //
  //              Odd Even Even Odd Odd Even
  // in binary:
  //                0    1    1   0   0    1   == 0x19
  //
  /**
   * See {@link #L_AND_G_PATTERNS}; these values similarly represent patterns of
   * even-odd parity encodings of digits that imply both the number system (0 or 1)
   * used, and the check digit.
   */
  static NUMSYS_AND_CHECK_DIGIT_PATTERNS = [
    Int32Array.from([56, 52, 50, 49, 44, 38, 35, 42, 41, 37]),
    Int32Array.from([7, 11, 13, 14, 19, 25, 28, 21, 22, 1])
  ];
  decodeMiddleCounters;
  constructor() {
    super();
    this.decodeMiddleCounters = new Int32Array(4);
  }
  /**
   * @throws NotFoundException
   */
  // @Override
  decodeMiddle(row, startRange, result) {
    const counters = this.decodeMiddleCounters.map((x) => x);
    counters[0] = 0;
    counters[1] = 0;
    counters[2] = 0;
    counters[3] = 0;
    const end = row.getSize();
    let rowOffset = startRange[1];
    let lgPatternFound = 0;
    for (let x = 0; x < 6 && rowOffset < end; x++) {
      const bestMatch = UPCEReader.decodeDigit(row, counters, rowOffset, UPCEReader.L_AND_G_PATTERNS);
      result += String.fromCharCode("0".charCodeAt(0) + bestMatch % 10);
      for (let counter of counters) {
        rowOffset += counter;
      }
      if (bestMatch >= 10) {
        lgPatternFound |= 1 << 5 - x;
      }
    }
    UPCEReader.determineNumSysAndCheckDigit(new StringBuilder.ZXingStringBuilder(result), lgPatternFound);
    return rowOffset;
  }
  /**
   * @throws NotFoundException
   */
  // @Override
  decodeEnd(row, endStart) {
    return UPCEReader.findGuardPatternWithoutCounters(row, endStart, true, UPCEReader.MIDDLE_END_PATTERN);
  }
  /**
   * @throws FormatException
   */
  // @Override
  checkChecksum(s) {
    return UPCEANReader.UPCEANReader.checkChecksum(UPCEReader.convertUPCEtoUPCA(s));
  }
  /**
   * @throws NotFoundException
   */
  static determineNumSysAndCheckDigit(resultString, lgPatternFound) {
    for (let numSys = 0; numSys <= 1; numSys++) {
      for (let d = 0; d < 10; d++) {
        if (lgPatternFound === this.NUMSYS_AND_CHECK_DIGIT_PATTERNS[numSys][d]) {
          resultString.insert(
            0,
            /*(char)*/
            "0" + numSys
          );
          resultString.append(
            /*(char)*/
            "0" + d
          );
          return;
        }
      }
    }
    throw NotFoundException.NotFoundException.getNotFoundInstance();
  }
  // @Override
  getBarcodeFormat() {
    return BarcodeFormat.BarcodeFormat.UPC_E;
  }
  /**
   * Expands a UPC-E value back into its full, equivalent UPC-A code value.
   *
   * @param upce UPC-E code as string of digits
   * @return equivalent UPC-A code as string of digits
   */
  static convertUPCEtoUPCA(upce) {
    const upceChars = upce.slice(1, 7).split("").map((x) => x.charCodeAt(0));
    const result = new StringBuilder.ZXingStringBuilder(
      /*12*/
    );
    result.append(upce.charAt(0));
    let lastChar = upceChars[5];
    switch (lastChar) {
      case 0:
      case 1:
      case 2:
        result.appendChars(upceChars, 0, 2);
        result.append(lastChar);
        result.append("0000");
        result.appendChars(upceChars, 2, 3);
        break;
      case 3:
        result.appendChars(upceChars, 0, 3);
        result.append("00000");
        result.appendChars(upceChars, 3, 2);
        break;
      case 4:
        result.appendChars(upceChars, 0, 4);
        result.append("00000");
        result.append(upceChars[4]);
        break;
      default:
        result.appendChars(upceChars, 0, 5);
        result.append("0000");
        result.append(lastChar);
        break;
    }
    if (upce.length >= 8) {
      result.append(upce.charAt(7));
    }
    return result.toString();
  }
}

exports.UPCEReader = UPCEReader;
//# sourceMappingURL=UPCEReader.cjs.map
//# sourceMappingURL=UPCEReader.cjs.map