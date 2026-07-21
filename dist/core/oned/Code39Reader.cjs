'use strict';

var BarcodeFormat = require('../BarcodeFormat');
var ChecksumException = require('../ChecksumException');
var FormatException = require('../FormatException');
var NotFoundException = require('../NotFoundException');
var OneDReader = require('./OneDReader');
var Result = require('../Result');
var ResultPoint = require('../ResultPoint');

class Code39Reader extends OneDReader.OneDReader {
  static ALPHABET_STRING = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%";
  /**
   * These represent the encodings of characters, as patterns of wide and narrow bars.
   * The 9 least-significant bits of each int correspond to the pattern of wide and narrow,
   * with 1s representing "wide" and 0s representing narrow.
   */
  static CHARACTER_ENCODINGS = [
    52,
    289,
    97,
    352,
    49,
    304,
    112,
    37,
    292,
    100,
    // 0-9
    265,
    73,
    328,
    25,
    280,
    88,
    13,
    268,
    76,
    28,
    // A-J
    259,
    67,
    322,
    19,
    274,
    82,
    7,
    262,
    70,
    22,
    // K-T
    385,
    193,
    448,
    145,
    400,
    208,
    133,
    388,
    196,
    168,
    // U-$
    162,
    138,
    42
    // /-%
  ];
  static ASTERISK_ENCODING = 148;
  usingCheckDigit;
  extendedMode;
  decodeRowResult;
  counters;
  /**
   * Creates a reader that assumes all encoded data is data, and does not treat the final
   * character as a check digit. It will not decoded "extended Code 39" sequences.
   */
  // public Code39Reader() {
  //   this(false);
  // }
  /**
   * Creates a reader that can be configured to check the last character as a check digit.
   * It will not decoded "extended Code 39" sequences.
   *
   * @param usingCheckDigit if true, treat the last data character as a check digit, not
   * data, and verify that the checksum passes.
   */
  // public Code39Reader(boolean usingCheckDigit) {
  //   this(usingCheckDigit, false);
  // }
  /**
   * Creates a reader that can be configured to check the last character as a check digit,
   * or optionally attempt to decode "extended Code 39" sequences that are used to encode
   * the full ASCII character set.
   *
   * @param usingCheckDigit if true, treat the last data character as a check digit, not
   * data, and verify that the checksum passes.
   * @param extendedMode if true, will attempt to decode extended Code 39 sequences in the
   * text.
   */
  constructor(usingCheckDigit = false, extendedMode = false) {
    super();
    this.usingCheckDigit = usingCheckDigit;
    this.extendedMode = extendedMode;
    this.decodeRowResult = "";
    this.counters = new Int32Array(9);
  }
  decodeRow(rowNumber, row, hints) {
    let theCounters = this.counters;
    theCounters.fill(0);
    this.decodeRowResult = "";
    let start = Code39Reader.findAsteriskPattern(row, theCounters);
    let nextStart = row.getNextSet(start[1]);
    let end = row.getSize();
    let decodedChar;
    let lastStart;
    do {
      Code39Reader.recordPattern(row, nextStart, theCounters);
      let pattern = Code39Reader.toNarrowWidePattern(theCounters);
      if (pattern < 0) {
        throw new NotFoundException.NotFoundException();
      }
      decodedChar = Code39Reader.patternToChar(pattern);
      this.decodeRowResult += decodedChar;
      lastStart = nextStart;
      for (let counter of theCounters) {
        nextStart += counter;
      }
      nextStart = row.getNextSet(nextStart);
    } while (decodedChar !== "*");
    this.decodeRowResult = this.decodeRowResult.substring(0, this.decodeRowResult.length - 1);
    let lastPatternSize = 0;
    for (let counter of theCounters) {
      lastPatternSize += counter;
    }
    let whiteSpaceAfterEnd = nextStart - lastStart - lastPatternSize;
    if (nextStart !== end && whiteSpaceAfterEnd * 2 < lastPatternSize) {
      throw new NotFoundException.NotFoundException();
    }
    if (this.usingCheckDigit) {
      let max = this.decodeRowResult.length - 1;
      let total = 0;
      for (let i = 0; i < max; i++) {
        total += Code39Reader.ALPHABET_STRING.indexOf(this.decodeRowResult.charAt(i));
      }
      if (this.decodeRowResult.charAt(max) !== Code39Reader.ALPHABET_STRING.charAt(total % 43)) {
        throw new ChecksumException.ChecksumException();
      }
      this.decodeRowResult = this.decodeRowResult.substring(0, max);
    }
    if (this.decodeRowResult.length === 0) {
      throw new NotFoundException.NotFoundException();
    }
    let resultString;
    if (this.extendedMode) {
      resultString = Code39Reader.decodeExtended(this.decodeRowResult);
    } else {
      resultString = this.decodeRowResult;
    }
    let left = (start[1] + start[0]) / 2;
    let right = lastStart + lastPatternSize / 2;
    return new Result.Result(
      resultString,
      null,
      0,
      [new ResultPoint.ResultPoint(left, rowNumber), new ResultPoint.ResultPoint(right, rowNumber)],
      BarcodeFormat.BarcodeFormat.CODE_39,
      (/* @__PURE__ */ new Date()).getTime()
    );
  }
  static findAsteriskPattern(row, counters) {
    let width = row.getSize();
    let rowOffset = row.getNextSet(0);
    let counterPosition = 0;
    let patternStart = rowOffset;
    let isWhite = false;
    let patternLength = counters.length;
    for (let i = rowOffset; i < width; i++) {
      if (row.get(i) !== isWhite) {
        counters[counterPosition]++;
      } else {
        if (counterPosition === patternLength - 1) {
          if (this.toNarrowWidePattern(counters) === Code39Reader.ASTERISK_ENCODING && row.isRange(Math.max(0, patternStart - Math.floor((i - patternStart) / 2)), patternStart, false)) {
            return [patternStart, i];
          }
          patternStart += counters[0] + counters[1];
          counters.copyWithin(0, 2, 2 + counterPosition - 1);
          counters[counterPosition - 1] = 0;
          counters[counterPosition] = 0;
          counterPosition--;
        } else {
          counterPosition++;
        }
        counters[counterPosition] = 1;
        isWhite = !isWhite;
      }
    }
    throw new NotFoundException.NotFoundException();
  }
  // For efficiency, returns -1 on failure. Not throwing here saved as many as 700 exceptions
  // per image when using some of our blackbox images.
  static toNarrowWidePattern(counters) {
    let numCounters = counters.length;
    let maxNarrowCounter = 0;
    let wideCounters;
    do {
      let minCounter = 2147483647;
      for (let counter of counters) {
        if (counter < minCounter && counter > maxNarrowCounter) {
          minCounter = counter;
        }
      }
      maxNarrowCounter = minCounter;
      wideCounters = 0;
      let totalWideCountersWidth = 0;
      let pattern = 0;
      for (let i = 0; i < numCounters; i++) {
        let counter = counters[i];
        if (counter > maxNarrowCounter) {
          pattern |= 1 << numCounters - 1 - i;
          wideCounters++;
          totalWideCountersWidth += counter;
        }
      }
      if (wideCounters === 3) {
        for (let i = 0; i < numCounters && wideCounters > 0; i++) {
          let counter = counters[i];
          if (counter > maxNarrowCounter) {
            wideCounters--;
            if (counter * 2 >= totalWideCountersWidth) {
              return -1;
            }
          }
        }
        return pattern;
      }
    } while (wideCounters > 3);
    return -1;
  }
  static patternToChar(pattern) {
    for (let i = 0; i < Code39Reader.CHARACTER_ENCODINGS.length; i++) {
      if (Code39Reader.CHARACTER_ENCODINGS[i] === pattern) {
        return Code39Reader.ALPHABET_STRING.charAt(i);
      }
    }
    if (pattern === Code39Reader.ASTERISK_ENCODING) {
      return "*";
    }
    throw new NotFoundException.NotFoundException();
  }
  static decodeExtended(encoded) {
    let length = encoded.length;
    let decoded = "";
    for (let i = 0; i < length; i++) {
      let c = encoded.charAt(i);
      if (c === "+" || c === "$" || c === "%" || c === "/") {
        let next = encoded.charAt(i + 1);
        let decodedChar = "\0";
        switch (c) {
          case "+":
            if (next >= "A" && next <= "Z") {
              decodedChar = String.fromCharCode(next.charCodeAt(0) + 32);
            } else {
              throw new FormatException.FormatException();
            }
            break;
          case "$":
            if (next >= "A" && next <= "Z") {
              decodedChar = String.fromCharCode(next.charCodeAt(0) - 64);
            } else {
              throw new FormatException.FormatException();
            }
            break;
          case "%":
            if (next >= "A" && next <= "E") {
              decodedChar = String.fromCharCode(next.charCodeAt(0) - 38);
            } else if (next >= "F" && next <= "J") {
              decodedChar = String.fromCharCode(next.charCodeAt(0) - 11);
            } else if (next >= "K" && next <= "O") {
              decodedChar = String.fromCharCode(next.charCodeAt(0) + 16);
            } else if (next >= "P" && next <= "T") {
              decodedChar = String.fromCharCode(next.charCodeAt(0) + 43);
            } else if (next === "U") {
              decodedChar = "\0";
            } else if (next === "V") {
              decodedChar = "@";
            } else if (next === "W") {
              decodedChar = "`";
            } else if (next === "X" || next === "Y" || next === "Z") {
              decodedChar = "\x7F";
            } else {
              throw new FormatException.FormatException();
            }
            break;
          case "/":
            if (next >= "A" && next <= "O") {
              decodedChar = String.fromCharCode(next.charCodeAt(0) - 32);
            } else if (next === "Z") {
              decodedChar = ":";
            } else {
              throw new FormatException.FormatException();
            }
            break;
        }
        decoded += decodedChar;
        i++;
      } else {
        decoded += c;
      }
    }
    return decoded;
  }
}

exports.Code39Reader = Code39Reader;
//# sourceMappingURL=Code39Reader.cjs.map
//# sourceMappingURL=Code39Reader.cjs.map