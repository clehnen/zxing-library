'use strict';

var BarcodeFormat = require('../BarcodeFormat');
var UPCEANReader = require('./UPCEANReader');
var NotFoundException = require('../NotFoundException');

class EAN13Reader extends UPCEANReader.UPCEANReader {
  static FIRST_DIGIT_ENCODINGS = [0, 11, 13, 14, 19, 25, 28, 21, 22, 26];
  decodeMiddleCounters;
  constructor() {
    super();
    this.decodeMiddleCounters = Int32Array.from([0, 0, 0, 0]);
  }
  decodeMiddle(row, startRange, resultString) {
    let counters = this.decodeMiddleCounters;
    counters[0] = 0;
    counters[1] = 0;
    counters[2] = 0;
    counters[3] = 0;
    let end = row.getSize();
    let rowOffset = startRange[1];
    let lgPatternFound = 0;
    for (let x = 0; x < 6 && rowOffset < end; x++) {
      let bestMatch = UPCEANReader.UPCEANReader.decodeDigit(row, counters, rowOffset, UPCEANReader.UPCEANReader.L_AND_G_PATTERNS);
      resultString += String.fromCharCode("0".charCodeAt(0) + bestMatch % 10);
      for (let counter of counters) {
        rowOffset += counter;
      }
      if (bestMatch >= 10) {
        lgPatternFound |= 1 << 5 - x;
      }
    }
    resultString = EAN13Reader.determineFirstDigit(resultString, lgPatternFound);
    let middleRange = UPCEANReader.UPCEANReader.findGuardPattern(row, rowOffset, true, UPCEANReader.UPCEANReader.MIDDLE_PATTERN, new Int32Array(UPCEANReader.UPCEANReader.MIDDLE_PATTERN.length).fill(0));
    rowOffset = middleRange[1];
    for (let x = 0; x < 6 && rowOffset < end; x++) {
      let bestMatch = UPCEANReader.UPCEANReader.decodeDigit(row, counters, rowOffset, UPCEANReader.UPCEANReader.L_PATTERNS);
      resultString += String.fromCharCode("0".charCodeAt(0) + bestMatch);
      for (let counter of counters) {
        rowOffset += counter;
      }
    }
    return { rowOffset, resultString };
  }
  getBarcodeFormat() {
    return BarcodeFormat.BarcodeFormat.EAN_13;
  }
  static determineFirstDigit(resultString, lgPatternFound) {
    for (let d = 0; d < 10; d++) {
      if (lgPatternFound === this.FIRST_DIGIT_ENCODINGS[d]) {
        resultString = String.fromCharCode("0".charCodeAt(0) + d) + resultString;
        return resultString;
      }
    }
    throw new NotFoundException.NotFoundException();
  }
}

exports.EAN13Reader = EAN13Reader;
//# sourceMappingURL=EAN13Reader.cjs.map
//# sourceMappingURL=EAN13Reader.cjs.map