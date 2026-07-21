import { BarcodeFormat } from '../BarcodeFormat';
import { ChecksumException } from '../ChecksumException';
import { DecodeHintType } from '../DecodeHintType';
import { FormatException } from '../FormatException';
import { NotFoundException } from '../NotFoundException';
import { Result } from '../Result';
import { ResultPoint } from '../ResultPoint';
import { OneDReader } from './OneDReader';

class Code128Reader extends OneDReader {
  static CODE_PATTERNS = [
    Int32Array.from([2, 1, 2, 2, 2, 2]),
    Int32Array.from([2, 2, 2, 1, 2, 2]),
    Int32Array.from([2, 2, 2, 2, 2, 1]),
    Int32Array.from([1, 2, 1, 2, 2, 3]),
    Int32Array.from([1, 2, 1, 3, 2, 2]),
    Int32Array.from([1, 3, 1, 2, 2, 2]),
    Int32Array.from([1, 2, 2, 2, 1, 3]),
    Int32Array.from([1, 2, 2, 3, 1, 2]),
    Int32Array.from([1, 3, 2, 2, 1, 2]),
    Int32Array.from([2, 2, 1, 2, 1, 3]),
    Int32Array.from([2, 2, 1, 3, 1, 2]),
    Int32Array.from([2, 3, 1, 2, 1, 2]),
    Int32Array.from([1, 1, 2, 2, 3, 2]),
    Int32Array.from([1, 2, 2, 1, 3, 2]),
    Int32Array.from([1, 2, 2, 2, 3, 1]),
    Int32Array.from([1, 1, 3, 2, 2, 2]),
    Int32Array.from([1, 2, 3, 1, 2, 2]),
    Int32Array.from([1, 2, 3, 2, 2, 1]),
    Int32Array.from([2, 2, 3, 2, 1, 1]),
    Int32Array.from([2, 2, 1, 1, 3, 2]),
    Int32Array.from([2, 2, 1, 2, 3, 1]),
    Int32Array.from([2, 1, 3, 2, 1, 2]),
    Int32Array.from([2, 2, 3, 1, 1, 2]),
    Int32Array.from([3, 1, 2, 1, 3, 1]),
    Int32Array.from([3, 1, 1, 2, 2, 2]),
    Int32Array.from([3, 2, 1, 1, 2, 2]),
    Int32Array.from([3, 2, 1, 2, 2, 1]),
    Int32Array.from([3, 1, 2, 2, 1, 2]),
    Int32Array.from([3, 2, 2, 1, 1, 2]),
    Int32Array.from([3, 2, 2, 2, 1, 1]),
    Int32Array.from([2, 1, 2, 1, 2, 3]),
    Int32Array.from([2, 1, 2, 3, 2, 1]),
    Int32Array.from([2, 3, 2, 1, 2, 1]),
    Int32Array.from([1, 1, 1, 3, 2, 3]),
    Int32Array.from([1, 3, 1, 1, 2, 3]),
    Int32Array.from([1, 3, 1, 3, 2, 1]),
    Int32Array.from([1, 1, 2, 3, 1, 3]),
    Int32Array.from([1, 3, 2, 1, 1, 3]),
    Int32Array.from([1, 3, 2, 3, 1, 1]),
    Int32Array.from([2, 1, 1, 3, 1, 3]),
    Int32Array.from([2, 3, 1, 1, 1, 3]),
    Int32Array.from([2, 3, 1, 3, 1, 1]),
    Int32Array.from([1, 1, 2, 1, 3, 3]),
    Int32Array.from([1, 1, 2, 3, 3, 1]),
    Int32Array.from([1, 3, 2, 1, 3, 1]),
    Int32Array.from([1, 1, 3, 1, 2, 3]),
    Int32Array.from([1, 1, 3, 3, 2, 1]),
    Int32Array.from([1, 3, 3, 1, 2, 1]),
    Int32Array.from([3, 1, 3, 1, 2, 1]),
    Int32Array.from([2, 1, 1, 3, 3, 1]),
    Int32Array.from([2, 3, 1, 1, 3, 1]),
    Int32Array.from([2, 1, 3, 1, 1, 3]),
    Int32Array.from([2, 1, 3, 3, 1, 1]),
    Int32Array.from([2, 1, 3, 1, 3, 1]),
    Int32Array.from([3, 1, 1, 1, 2, 3]),
    Int32Array.from([3, 1, 1, 3, 2, 1]),
    Int32Array.from([3, 3, 1, 1, 2, 1]),
    Int32Array.from([3, 1, 2, 1, 1, 3]),
    Int32Array.from([3, 1, 2, 3, 1, 1]),
    Int32Array.from([3, 3, 2, 1, 1, 1]),
    Int32Array.from([3, 1, 4, 1, 1, 1]),
    Int32Array.from([2, 2, 1, 4, 1, 1]),
    Int32Array.from([4, 3, 1, 1, 1, 1]),
    Int32Array.from([1, 1, 1, 2, 2, 4]),
    Int32Array.from([1, 1, 1, 4, 2, 2]),
    Int32Array.from([1, 2, 1, 1, 2, 4]),
    Int32Array.from([1, 2, 1, 4, 2, 1]),
    Int32Array.from([1, 4, 1, 1, 2, 2]),
    Int32Array.from([1, 4, 1, 2, 2, 1]),
    Int32Array.from([1, 1, 2, 2, 1, 4]),
    Int32Array.from([1, 1, 2, 4, 1, 2]),
    Int32Array.from([1, 2, 2, 1, 1, 4]),
    Int32Array.from([1, 2, 2, 4, 1, 1]),
    Int32Array.from([1, 4, 2, 1, 1, 2]),
    Int32Array.from([1, 4, 2, 2, 1, 1]),
    Int32Array.from([2, 4, 1, 2, 1, 1]),
    Int32Array.from([2, 2, 1, 1, 1, 4]),
    Int32Array.from([4, 1, 3, 1, 1, 1]),
    Int32Array.from([2, 4, 1, 1, 1, 2]),
    Int32Array.from([1, 3, 4, 1, 1, 1]),
    Int32Array.from([1, 1, 1, 2, 4, 2]),
    Int32Array.from([1, 2, 1, 1, 4, 2]),
    Int32Array.from([1, 2, 1, 2, 4, 1]),
    Int32Array.from([1, 1, 4, 2, 1, 2]),
    Int32Array.from([1, 2, 4, 1, 1, 2]),
    Int32Array.from([1, 2, 4, 2, 1, 1]),
    Int32Array.from([4, 1, 1, 2, 1, 2]),
    Int32Array.from([4, 2, 1, 1, 1, 2]),
    Int32Array.from([4, 2, 1, 2, 1, 1]),
    Int32Array.from([2, 1, 2, 1, 4, 1]),
    Int32Array.from([2, 1, 4, 1, 2, 1]),
    Int32Array.from([4, 1, 2, 1, 2, 1]),
    Int32Array.from([1, 1, 1, 1, 4, 3]),
    Int32Array.from([1, 1, 1, 3, 4, 1]),
    Int32Array.from([1, 3, 1, 1, 4, 1]),
    Int32Array.from([1, 1, 4, 1, 1, 3]),
    Int32Array.from([1, 1, 4, 3, 1, 1]),
    Int32Array.from([4, 1, 1, 1, 1, 3]),
    Int32Array.from([4, 1, 1, 3, 1, 1]),
    Int32Array.from([1, 1, 3, 1, 4, 1]),
    Int32Array.from([1, 1, 4, 1, 3, 1]),
    Int32Array.from([3, 1, 1, 1, 4, 1]),
    Int32Array.from([4, 1, 1, 1, 3, 1]),
    Int32Array.from([2, 1, 1, 4, 1, 2]),
    Int32Array.from([2, 1, 1, 2, 1, 4]),
    Int32Array.from([2, 1, 1, 2, 3, 2]),
    Int32Array.from([2, 3, 3, 1, 1, 1, 2])
  ];
  static MAX_AVG_VARIANCE = 0.25;
  static MAX_INDIVIDUAL_VARIANCE = 0.7;
  static CODE_SHIFT = 98;
  static CODE_CODE_C = 99;
  static CODE_CODE_B = 100;
  static CODE_CODE_A = 101;
  static CODE_FNC_1 = 102;
  static CODE_FNC_2 = 97;
  static CODE_FNC_3 = 96;
  static CODE_FNC_4_A = 101;
  static CODE_FNC_4_B = 100;
  static CODE_START_A = 103;
  static CODE_START_B = 104;
  static CODE_START_C = 105;
  static CODE_STOP = 106;
  static findStartPattern(row) {
    const width = row.getSize();
    const rowOffset = row.getNextSet(0);
    let counterPosition = 0;
    let counters = Int32Array.from([0, 0, 0, 0, 0, 0]);
    let patternStart = rowOffset;
    let isWhite = false;
    const patternLength = 6;
    for (let i = rowOffset; i < width; i++) {
      if (row.get(i) !== isWhite) {
        counters[counterPosition]++;
      } else {
        if (counterPosition === patternLength - 1) {
          let bestVariance = Code128Reader.MAX_AVG_VARIANCE;
          let bestMatch = -1;
          for (let startCode = Code128Reader.CODE_START_A; startCode <= Code128Reader.CODE_START_C; startCode++) {
            const variance = OneDReader.patternMatchVariance(
              counters,
              Code128Reader.CODE_PATTERNS[startCode],
              Code128Reader.MAX_INDIVIDUAL_VARIANCE
            );
            if (variance < bestVariance) {
              bestVariance = variance;
              bestMatch = startCode;
            }
          }
          if (bestMatch >= 0 && row.isRange(Math.max(0, patternStart - (i - patternStart) / 2), patternStart, false)) {
            return Int32Array.from([patternStart, i, bestMatch]);
          }
          patternStart += counters[0] + counters[1];
          counters = counters.slice(2, counters.length);
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
    throw new NotFoundException();
  }
  static decodeCode(row, counters, rowOffset) {
    OneDReader.recordPattern(row, rowOffset, counters);
    let bestVariance = Code128Reader.MAX_AVG_VARIANCE;
    let bestMatch = -1;
    for (let d = 0; d < Code128Reader.CODE_PATTERNS.length; d++) {
      const pattern = Code128Reader.CODE_PATTERNS[d];
      const variance = this.patternMatchVariance(counters, pattern, Code128Reader.MAX_INDIVIDUAL_VARIANCE);
      if (variance < bestVariance) {
        bestVariance = variance;
        bestMatch = d;
      }
    }
    if (bestMatch >= 0) {
      return bestMatch;
    } else {
      throw new NotFoundException();
    }
  }
  decodeRow(rowNumber, row, hints) {
    const convertFNC1 = hints && hints.get(DecodeHintType.ASSUME_GS1) === true;
    const startPatternInfo = Code128Reader.findStartPattern(row);
    const startCode = startPatternInfo[2];
    let currentRawCodesIndex = 0;
    const rawCodes = new Uint8Array(20);
    rawCodes[currentRawCodesIndex++] = startCode;
    let codeSet;
    switch (startCode) {
      case Code128Reader.CODE_START_A:
        codeSet = Code128Reader.CODE_CODE_A;
        break;
      case Code128Reader.CODE_START_B:
        codeSet = Code128Reader.CODE_CODE_B;
        break;
      case Code128Reader.CODE_START_C:
        codeSet = Code128Reader.CODE_CODE_C;
        break;
      default:
        throw new FormatException();
    }
    let done = false;
    let isNextShifted = false;
    let result = "";
    let lastStart = startPatternInfo[0];
    let nextStart = startPatternInfo[1];
    const counters = Int32Array.from([0, 0, 0, 0, 0, 0]);
    let lastCode = 0;
    let code = 0;
    let checksumTotal = startCode;
    let multiplier = 0;
    let lastCharacterWasPrintable = true;
    let upperMode = false;
    let shiftUpperMode = false;
    while (!done) {
      const unshift = isNextShifted;
      isNextShifted = false;
      lastCode = code;
      code = Code128Reader.decodeCode(row, counters, nextStart);
      rawCodes[currentRawCodesIndex++] = code;
      if (code !== Code128Reader.CODE_STOP) {
        lastCharacterWasPrintable = true;
      }
      if (code !== Code128Reader.CODE_STOP) {
        multiplier++;
        checksumTotal += multiplier * code;
      }
      lastStart = nextStart;
      nextStart += counters.reduce((previous, current) => previous + current, 0);
      switch (code) {
        case Code128Reader.CODE_START_A:
        case Code128Reader.CODE_START_B:
        case Code128Reader.CODE_START_C:
          throw new FormatException();
      }
      switch (codeSet) {
        case Code128Reader.CODE_CODE_A:
          if (code < 64) {
            if (shiftUpperMode === upperMode) {
              result += String.fromCharCode(" ".charCodeAt(0) + code);
            } else {
              result += String.fromCharCode(" ".charCodeAt(0) + code + 128);
            }
            shiftUpperMode = false;
          } else if (code < 96) {
            if (shiftUpperMode === upperMode) {
              result += String.fromCharCode(code - 64);
            } else {
              result += String.fromCharCode(code + 64);
            }
            shiftUpperMode = false;
          } else {
            if (code !== Code128Reader.CODE_STOP) {
              lastCharacterWasPrintable = false;
            }
            switch (code) {
              case Code128Reader.CODE_FNC_1:
                if (convertFNC1) {
                  if (result.length === 0) {
                    result += "]C1";
                  } else {
                    result += String.fromCharCode(29);
                  }
                }
                break;
              case Code128Reader.CODE_FNC_2:
              case Code128Reader.CODE_FNC_3:
                break;
              case Code128Reader.CODE_FNC_4_A:
                if (!upperMode && shiftUpperMode) {
                  upperMode = true;
                  shiftUpperMode = false;
                } else if (upperMode && shiftUpperMode) {
                  upperMode = false;
                  shiftUpperMode = false;
                } else {
                  shiftUpperMode = true;
                }
                break;
              case Code128Reader.CODE_SHIFT:
                isNextShifted = true;
                codeSet = Code128Reader.CODE_CODE_B;
                break;
              case Code128Reader.CODE_CODE_B:
                codeSet = Code128Reader.CODE_CODE_B;
                break;
              case Code128Reader.CODE_CODE_C:
                codeSet = Code128Reader.CODE_CODE_C;
                break;
              case Code128Reader.CODE_STOP:
                done = true;
                break;
            }
          }
          break;
        case Code128Reader.CODE_CODE_B:
          if (code < 96) {
            if (shiftUpperMode === upperMode) {
              result += String.fromCharCode(" ".charCodeAt(0) + code);
            } else {
              result += String.fromCharCode(" ".charCodeAt(0) + code + 128);
            }
            shiftUpperMode = false;
          } else {
            if (code !== Code128Reader.CODE_STOP) {
              lastCharacterWasPrintable = false;
            }
            switch (code) {
              case Code128Reader.CODE_FNC_1:
                if (convertFNC1) {
                  if (result.length === 0) {
                    result += "]C1";
                  } else {
                    result += String.fromCharCode(29);
                  }
                }
                break;
              case Code128Reader.CODE_FNC_2:
              case Code128Reader.CODE_FNC_3:
                break;
              case Code128Reader.CODE_FNC_4_B:
                if (!upperMode && shiftUpperMode) {
                  upperMode = true;
                  shiftUpperMode = false;
                } else if (upperMode && shiftUpperMode) {
                  upperMode = false;
                  shiftUpperMode = false;
                } else {
                  shiftUpperMode = true;
                }
                break;
              case Code128Reader.CODE_SHIFT:
                isNextShifted = true;
                codeSet = Code128Reader.CODE_CODE_A;
                break;
              case Code128Reader.CODE_CODE_A:
                codeSet = Code128Reader.CODE_CODE_A;
                break;
              case Code128Reader.CODE_CODE_C:
                codeSet = Code128Reader.CODE_CODE_C;
                break;
              case Code128Reader.CODE_STOP:
                done = true;
                break;
            }
          }
          break;
        case Code128Reader.CODE_CODE_C:
          if (code < 100) {
            if (code < 10) {
              result += "0";
            }
            result += code;
          } else {
            if (code !== Code128Reader.CODE_STOP) {
              lastCharacterWasPrintable = false;
            }
            switch (code) {
              case Code128Reader.CODE_FNC_1:
                if (convertFNC1) {
                  if (result.length === 0) {
                    result += "]C1";
                  } else {
                    result += String.fromCharCode(29);
                  }
                }
                break;
              case Code128Reader.CODE_CODE_A:
                codeSet = Code128Reader.CODE_CODE_A;
                break;
              case Code128Reader.CODE_CODE_B:
                codeSet = Code128Reader.CODE_CODE_B;
                break;
              case Code128Reader.CODE_STOP:
                done = true;
                break;
            }
          }
          break;
      }
      if (unshift) {
        codeSet = codeSet === Code128Reader.CODE_CODE_A ? Code128Reader.CODE_CODE_B : Code128Reader.CODE_CODE_A;
      }
    }
    const lastPatternSize = nextStart - lastStart;
    nextStart = row.getNextUnset(nextStart);
    if (!row.isRange(
      nextStart,
      Math.min(row.getSize(), nextStart + (nextStart - lastStart) / 2),
      false
    )) {
      throw new NotFoundException();
    }
    checksumTotal -= multiplier * lastCode;
    if (checksumTotal % 103 !== lastCode) {
      throw new ChecksumException();
    }
    const resultLength = result.length;
    if (resultLength === 0) {
      throw new NotFoundException();
    }
    if (resultLength > 0 && lastCharacterWasPrintable) {
      if (codeSet === Code128Reader.CODE_CODE_C) {
        result = result.substring(0, resultLength - 2);
      } else {
        result = result.substring(0, resultLength - 1);
      }
    }
    const left = (startPatternInfo[1] + startPatternInfo[0]) / 2;
    const right = lastStart + lastPatternSize / 2;
    const rawCodesSize = rawCodes.length;
    const rawBytes = new Uint8Array(rawCodesSize);
    for (let i = 0; i < rawCodesSize; i++) {
      rawBytes[i] = rawCodes[i];
    }
    const points = [new ResultPoint(left, rowNumber), new ResultPoint(right, rowNumber)];
    return new Result(result, rawBytes, 0, points, BarcodeFormat.CODE_128, (/* @__PURE__ */ new Date()).getTime());
  }
}

export { Code128Reader };
//# sourceMappingURL=Code128Reader.js.map
//# sourceMappingURL=Code128Reader.js.map