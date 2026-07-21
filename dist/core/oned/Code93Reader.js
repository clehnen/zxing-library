import { BarcodeFormat } from '../BarcodeFormat';
import { ChecksumException } from '../ChecksumException';
import { FormatException } from '../FormatException';
import { NotFoundException } from '../NotFoundException';
import { OneDReader } from './OneDReader';
import { Result } from '../Result';
import { ResultPoint } from '../ResultPoint';

class Code93Reader extends OneDReader {
  // Note that 'abcd' are dummy characters in place of control characters.
  static ALPHABET_STRING = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%abcd*";
  /**
   * These represent the encodings of characters, as patterns of wide and narrow bars.
   * The 9 least-significant bits of each int correspond to the pattern of wide and narrow.
   */
  static CHARACTER_ENCODINGS = [
    276,
    328,
    324,
    322,
    296,
    292,
    290,
    336,
    274,
    266,
    // 0-9
    424,
    420,
    418,
    404,
    402,
    394,
    360,
    356,
    354,
    308,
    // A-J
    282,
    344,
    332,
    326,
    300,
    278,
    436,
    434,
    428,
    422,
    // K-T
    406,
    410,
    364,
    358,
    310,
    314,
    // U-Z
    302,
    468,
    466,
    458,
    366,
    374,
    430,
    // - - %
    294,
    474,
    470,
    306,
    350
    // Control chars? $-*
  ];
  static ASTERISK_ENCODING = Code93Reader.CHARACTER_ENCODINGS[47];
  decodeRowResult;
  counters;
  //public Code93Reader() {
  //  decodeRowResult = new StringBuilder(20);
  //  counters = new int[6];
  //}
  constructor() {
    super();
    this.decodeRowResult = "";
    this.counters = new Int32Array(6);
  }
  decodeRow(rowNumber, row, hints) {
    let start = this.findAsteriskPattern(row);
    let nextStart = row.getNextSet(start[1]);
    let end = row.getSize();
    let theCounters = this.counters;
    theCounters.fill(0);
    this.decodeRowResult = "";
    let decodedChar;
    let lastStart;
    do {
      Code93Reader.recordPattern(row, nextStart, theCounters);
      let pattern = this.toPattern(theCounters);
      if (pattern < 0) {
        throw new NotFoundException();
      }
      decodedChar = this.patternToChar(pattern);
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
    if (nextStart === end || !row.get(nextStart)) {
      throw new NotFoundException();
    }
    if (this.decodeRowResult.length < 2) {
      throw new NotFoundException();
    }
    this.checkChecksums(this.decodeRowResult);
    this.decodeRowResult = this.decodeRowResult.substring(0, this.decodeRowResult.length - 2);
    let resultString = this.decodeExtended(this.decodeRowResult);
    let left = (start[1] + start[0]) / 2;
    let right = lastStart + lastPatternSize / 2;
    return new Result(
      resultString,
      null,
      0,
      [new ResultPoint(left, rowNumber), new ResultPoint(right, rowNumber)],
      BarcodeFormat.CODE_93,
      (/* @__PURE__ */ new Date()).getTime()
    );
  }
  findAsteriskPattern(row) {
    let width = row.getSize();
    let rowOffset = row.getNextSet(0);
    this.counters.fill(0);
    let theCounters = this.counters;
    let patternStart = rowOffset;
    let isWhite = false;
    let patternLength = theCounters.length;
    let counterPosition = 0;
    for (let i = rowOffset; i < width; i++) {
      if (row.get(i) !== isWhite) {
        theCounters[counterPosition]++;
      } else {
        if (counterPosition === patternLength - 1) {
          if (this.toPattern(theCounters) === Code93Reader.ASTERISK_ENCODING) {
            return new Int32Array([patternStart, i]);
          }
          patternStart += theCounters[0] + theCounters[1];
          theCounters.copyWithin(0, 2, 2 + counterPosition - 1);
          theCounters[counterPosition - 1] = 0;
          theCounters[counterPosition] = 0;
          counterPosition--;
        } else {
          counterPosition++;
        }
        theCounters[counterPosition] = 1;
        isWhite = !isWhite;
      }
    }
    throw new NotFoundException();
  }
  toPattern(counters) {
    let sum = 0;
    for (const counter of counters) {
      sum += counter;
    }
    let pattern = 0;
    let max = counters.length;
    for (let i = 0; i < max; i++) {
      let scaled = Math.round(counters[i] * 9 / sum);
      if (scaled < 1 || scaled > 4) {
        return -1;
      }
      if ((i & 1) === 0) {
        for (let j = 0; j < scaled; j++) {
          pattern = pattern << 1 | 1;
        }
      } else {
        pattern <<= scaled;
      }
    }
    return pattern;
  }
  patternToChar(pattern) {
    for (let i = 0; i < Code93Reader.CHARACTER_ENCODINGS.length; i++) {
      if (Code93Reader.CHARACTER_ENCODINGS[i] === pattern) {
        return Code93Reader.ALPHABET_STRING.charAt(i);
      }
    }
    throw new NotFoundException();
  }
  decodeExtended(encoded) {
    let length = encoded.length;
    let decoded = "";
    for (let i = 0; i < length; i++) {
      let c = encoded.charAt(i);
      if (c >= "a" && c <= "d") {
        if (i >= length - 1) {
          throw new FormatException();
        }
        let next = encoded.charAt(i + 1);
        let decodedChar = "\0";
        switch (c) {
          case "d":
            if (next >= "A" && next <= "Z") {
              decodedChar = String.fromCharCode(next.charCodeAt(0) + 32);
            } else {
              throw new FormatException();
            }
            break;
          case "a":
            if (next >= "A" && next <= "Z") {
              decodedChar = String.fromCharCode(next.charCodeAt(0) - 64);
            } else {
              throw new FormatException();
            }
            break;
          case "b":
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
            } else if (next >= "X" && next <= "Z") {
              decodedChar = String.fromCharCode(127);
            } else {
              throw new FormatException();
            }
            break;
          case "c":
            if (next >= "A" && next <= "O") {
              decodedChar = String.fromCharCode(next.charCodeAt(0) - 32);
            } else if (next === "Z") {
              decodedChar = ":";
            } else {
              throw new FormatException();
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
  checkChecksums(result) {
    let length = result.length;
    this.checkOneChecksum(result, length - 2, 20);
    this.checkOneChecksum(result, length - 1, 15);
  }
  checkOneChecksum(result, checkPosition, weightMax) {
    let weight = 1;
    let total = 0;
    for (let i = checkPosition - 1; i >= 0; i--) {
      total += weight * Code93Reader.ALPHABET_STRING.indexOf(result.charAt(i));
      if (++weight > weightMax) {
        weight = 1;
      }
    }
    if (result.charAt(checkPosition) !== Code93Reader.ALPHABET_STRING[total % 47]) {
      throw new ChecksumException();
    }
  }
}

export { Code93Reader };
//# sourceMappingURL=Code93Reader.js.map
//# sourceMappingURL=Code93Reader.js.map