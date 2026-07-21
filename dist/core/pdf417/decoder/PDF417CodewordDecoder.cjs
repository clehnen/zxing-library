'use strict';

var MathUtils = require('../../common/detector/MathUtils');
var PDF417Common = require('../PDF417Common');
var Float = require('../../util/Float');

class PDF417CodewordDecoder {
  // flag that the table is ready for use
  static bSymbolTableReady = false;
  static RATIOS_TABLE = new Array(PDF417Common.PDF417Common.SYMBOL_TABLE.length).map((x) => new Array(PDF417Common.PDF417Common.BARS_IN_MODULE));
  /* @note
   * this action have to be performed before first use of class
   * - static constructor
   * working with 32bit float (based from Java logic)
  */
  static initialize() {
    for (let i = 0; i < PDF417Common.PDF417Common.SYMBOL_TABLE.length; i++) {
      let currentSymbol = PDF417Common.PDF417Common.SYMBOL_TABLE[i];
      let currentBit = currentSymbol & 1;
      for (let j = 0; j < PDF417Common.PDF417Common.BARS_IN_MODULE; j++) {
        let size = 0;
        while ((currentSymbol & 1) === currentBit) {
          size += 1;
          currentSymbol >>= 1;
        }
        currentBit = currentSymbol & 1;
        if (!PDF417CodewordDecoder.RATIOS_TABLE[i]) {
          PDF417CodewordDecoder.RATIOS_TABLE[i] = new Array(PDF417Common.PDF417Common.BARS_IN_MODULE);
        }
        PDF417CodewordDecoder.RATIOS_TABLE[i][PDF417Common.PDF417Common.BARS_IN_MODULE - j - 1] = Math.fround(size / PDF417Common.PDF417Common.MODULES_IN_CODEWORD);
      }
    }
    this.bSymbolTableReady = true;
  }
  static getDecodedValue(moduleBitCount) {
    let decodedValue = PDF417CodewordDecoder.getDecodedCodewordValue(PDF417CodewordDecoder.sampleBitCounts(moduleBitCount));
    if (decodedValue !== -1) {
      return decodedValue;
    }
    return PDF417CodewordDecoder.getClosestDecodedValue(moduleBitCount);
  }
  static sampleBitCounts(moduleBitCount) {
    let bitCountSum = MathUtils.MathUtils.sum(moduleBitCount);
    let result = new Int32Array(PDF417Common.PDF417Common.BARS_IN_MODULE);
    let bitCountIndex = 0;
    let sumPreviousBits = 0;
    for (let i = 0; i < PDF417Common.PDF417Common.MODULES_IN_CODEWORD; i++) {
      let sampleIndex = bitCountSum / (2 * PDF417Common.PDF417Common.MODULES_IN_CODEWORD) + i * bitCountSum / PDF417Common.PDF417Common.MODULES_IN_CODEWORD;
      if (sumPreviousBits + moduleBitCount[bitCountIndex] <= sampleIndex) {
        sumPreviousBits += moduleBitCount[bitCountIndex];
        bitCountIndex++;
      }
      result[bitCountIndex]++;
    }
    return result;
  }
  static getDecodedCodewordValue(moduleBitCount) {
    let decodedValue = PDF417CodewordDecoder.getBitValue(moduleBitCount);
    return PDF417Common.PDF417Common.getCodeword(decodedValue) === -1 ? -1 : decodedValue;
  }
  static getBitValue(moduleBitCount) {
    let result = 0;
    for (let i = 0; i < moduleBitCount.length; i++) {
      for (let bit = 0; bit < moduleBitCount[i]; bit++) {
        result = result << 1 | (i % 2 === 0 ? 1 : 0);
      }
    }
    return Math.trunc(result);
  }
  // working with 32bit float (as in Java)
  static getClosestDecodedValue(moduleBitCount) {
    let bitCountSum = MathUtils.MathUtils.sum(moduleBitCount);
    let bitCountRatios = new Array(PDF417Common.PDF417Common.BARS_IN_MODULE);
    if (bitCountSum > 1) {
      for (let i = 0; i < bitCountRatios.length; i++) {
        bitCountRatios[i] = Math.fround(moduleBitCount[i] / bitCountSum);
      }
    }
    let bestMatchError = Float.Float.MAX_VALUE;
    let bestMatch = -1;
    if (!this.bSymbolTableReady) {
      PDF417CodewordDecoder.initialize();
    }
    for (let j = 0; j < PDF417CodewordDecoder.RATIOS_TABLE.length; j++) {
      let error = 0;
      let ratioTableRow = PDF417CodewordDecoder.RATIOS_TABLE[j];
      for (let k = 0; k < PDF417Common.PDF417Common.BARS_IN_MODULE; k++) {
        let diff = Math.fround(ratioTableRow[k] - bitCountRatios[k]);
        error += Math.fround(diff * diff);
        if (error >= bestMatchError) {
          break;
        }
      }
      if (error < bestMatchError) {
        bestMatchError = error;
        bestMatch = PDF417Common.PDF417Common.SYMBOL_TABLE[j];
      }
    }
    return bestMatch;
  }
}

exports.PDF417CodewordDecoder = PDF417CodewordDecoder;
//# sourceMappingURL=PDF417CodewordDecoder.cjs.map
//# sourceMappingURL=PDF417CodewordDecoder.cjs.map