'use strict';

var BarcodeFormat = require('../BarcodeFormat');
var UPCEANReader = require('./UPCEANReader');

class EAN8Reader extends UPCEANReader.UPCEANReader {
  decodeMiddleCounters;
  constructor() {
    super();
    this.decodeMiddleCounters = Int32Array.from([0, 0, 0, 0]);
  }
  decodeMiddle(row, startRange, resultString) {
    const counters = this.decodeMiddleCounters;
    counters[0] = 0;
    counters[1] = 0;
    counters[2] = 0;
    counters[3] = 0;
    let end = row.getSize();
    let rowOffset = startRange[1];
    for (let x = 0; x < 4 && rowOffset < end; x++) {
      let bestMatch = UPCEANReader.UPCEANReader.decodeDigit(row, counters, rowOffset, UPCEANReader.UPCEANReader.L_PATTERNS);
      resultString += String.fromCharCode("0".charCodeAt(0) + bestMatch);
      for (let counter of counters) {
        rowOffset += counter;
      }
    }
    let middleRange = UPCEANReader.UPCEANReader.findGuardPattern(row, rowOffset, true, UPCEANReader.UPCEANReader.MIDDLE_PATTERN, new Int32Array(UPCEANReader.UPCEANReader.MIDDLE_PATTERN.length).fill(0));
    rowOffset = middleRange[1];
    for (let x = 0; x < 4 && rowOffset < end; x++) {
      let bestMatch = UPCEANReader.UPCEANReader.decodeDigit(row, counters, rowOffset, UPCEANReader.UPCEANReader.L_PATTERNS);
      resultString += String.fromCharCode("0".charCodeAt(0) + bestMatch);
      for (let counter of counters) {
        rowOffset += counter;
      }
    }
    return { rowOffset, resultString };
  }
  getBarcodeFormat() {
    return BarcodeFormat.BarcodeFormat.EAN_8;
  }
}

exports.EAN8Reader = EAN8Reader;
//# sourceMappingURL=EAN8Reader.cjs.map
//# sourceMappingURL=EAN8Reader.cjs.map