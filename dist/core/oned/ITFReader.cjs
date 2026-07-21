'use strict';

var BarcodeFormat = require('../BarcodeFormat');
var DecodeHintType = require('../DecodeHintType');
var FormatException = require('../FormatException');
var NotFoundException = require('../NotFoundException');
var Result = require('../Result');
var ResultPoint = require('../ResultPoint');
var StringBuilder = require('../util/StringBuilder');
var ZXingSystem = require('../util/ZXingSystem');
var OneDReader = require('./OneDReader');

class ITFReader extends OneDReader.OneDReader {
  // private static W = 3; // Pixel width of a 3x wide line
  // private static w = 2; // Pixel width of a 2x wide line
  // private static N = 1; // Pixed width of a narrow line
  static PATTERNS = [
    Int32Array.from([1, 1, 2, 2, 1]),
    // 0
    Int32Array.from([2, 1, 1, 1, 2]),
    // 1
    Int32Array.from([1, 2, 1, 1, 2]),
    // 2
    Int32Array.from([2, 2, 1, 1, 1]),
    // 3
    Int32Array.from([1, 1, 2, 1, 2]),
    // 4
    Int32Array.from([2, 1, 2, 1, 1]),
    // 5
    Int32Array.from([1, 2, 2, 1, 1]),
    // 6
    Int32Array.from([1, 1, 1, 2, 2]),
    // 7
    Int32Array.from([2, 1, 1, 2, 1]),
    // 8
    Int32Array.from([1, 2, 1, 2, 1]),
    // 9
    Int32Array.from([1, 1, 3, 3, 1]),
    // 0
    Int32Array.from([3, 1, 1, 1, 3]),
    // 1
    Int32Array.from([1, 3, 1, 1, 3]),
    // 2
    Int32Array.from([3, 3, 1, 1, 1]),
    // 3
    Int32Array.from([1, 1, 3, 1, 3]),
    // 4
    Int32Array.from([3, 1, 3, 1, 1]),
    // 5
    Int32Array.from([1, 3, 3, 1, 1]),
    // 6
    Int32Array.from([1, 1, 1, 3, 3]),
    // 7
    Int32Array.from([3, 1, 1, 3, 1]),
    // 8
    Int32Array.from([1, 3, 1, 3, 1])
    // 9
  ];
  static MAX_AVG_VARIANCE = 0.38;
  static MAX_INDIVIDUAL_VARIANCE = 0.5;
  /* /!** Valid ITF lengths. Anything longer than the largest value is also allowed. *!/*/
  static DEFAULT_ALLOWED_LENGTHS = [6, 8, 10, 12, 14];
  // Stores the actual narrow line width of the image being decoded.
  narrowLineWidth = -1;
  /*/!**
   * Start/end guard pattern.
   *
   * Note: The end pattern is reversed because the row is reversed before
   * searching for the END_PATTERN
   *!/*/
  static START_PATTERN = Int32Array.from([1, 1, 1, 1]);
  static END_PATTERN_REVERSED = [
    Int32Array.from([1, 1, 2]),
    // 2x
    Int32Array.from([1, 1, 3])
    // 3x
  ];
  // See ITFWriter.PATTERNS
  /*
  
    /!**
     * Patterns of Wide / Narrow lines to indicate each digit
     *!/
    */
  decodeRow(rowNumber, row, hints) {
    let startRange = this.decodeStart(row);
    let endRange = this.decodeEnd(row);
    let result = new StringBuilder.ZXingStringBuilder();
    ITFReader.decodeMiddle(row, startRange[1], endRange[0], result);
    let resultString = result.toString();
    let allowedLengths = null;
    if (hints != null) {
      allowedLengths = hints.get(DecodeHintType.DecodeHintType.ALLOWED_LENGTHS);
    }
    if (allowedLengths == null) {
      allowedLengths = ITFReader.DEFAULT_ALLOWED_LENGTHS;
    }
    let length = resultString.length;
    let lengthOK = false;
    let maxAllowedLength = 0;
    for (let value of allowedLengths) {
      if (length === value) {
        lengthOK = true;
        break;
      }
      if (value > maxAllowedLength) {
        maxAllowedLength = value;
      }
    }
    if (!lengthOK && length > maxAllowedLength) {
      lengthOK = true;
    }
    if (!lengthOK) {
      throw new FormatException.FormatException();
    }
    const points = [new ResultPoint.ResultPoint(startRange[1], rowNumber), new ResultPoint.ResultPoint(endRange[0], rowNumber)];
    let resultReturn = new Result.Result(
      resultString,
      null,
      // no natural byte representation for these barcodes
      0,
      points,
      BarcodeFormat.BarcodeFormat.ITF,
      (/* @__PURE__ */ new Date()).getTime()
    );
    return resultReturn;
  }
  /*
  /!**
   * @param row          row of black/white values to search
   * @param payloadStart offset of start pattern
   * @param resultString {@link StringBuilder} to append decoded chars to
   * @throws NotFoundException if decoding could not complete successfully
   *!/*/
  static decodeMiddle(row, payloadStart, payloadEnd, resultString) {
    let counterDigitPair = new Int32Array(10);
    let counterBlack = new Int32Array(5);
    let counterWhite = new Int32Array(5);
    counterDigitPair.fill(0);
    counterBlack.fill(0);
    counterWhite.fill(0);
    while (payloadStart < payloadEnd) {
      OneDReader.OneDReader.recordPattern(row, payloadStart, counterDigitPair);
      for (let k = 0; k < 5; k++) {
        let twoK = 2 * k;
        counterBlack[k] = counterDigitPair[twoK];
        counterWhite[k] = counterDigitPair[twoK + 1];
      }
      let bestMatch = ITFReader.decodeDigit(counterBlack);
      resultString.append(bestMatch.toString());
      bestMatch = this.decodeDigit(counterWhite);
      resultString.append(bestMatch.toString());
      counterDigitPair.forEach(function(counterDigit) {
        payloadStart += counterDigit;
      });
    }
  }
  /*/!**
   * Identify where the start of the middle / payload section starts.
   *
   * @param row row of black/white values to search
   * @return Array, containing index of start of 'start block' and end of
   *         'start block'
   *!/*/
  decodeStart(row) {
    let endStart = ITFReader.skipWhiteSpace(row);
    let startPattern = ITFReader.findGuardPattern(row, endStart, ITFReader.START_PATTERN);
    this.narrowLineWidth = (startPattern[1] - startPattern[0]) / 4;
    this.validateQuietZone(row, startPattern[0]);
    return startPattern;
  }
  /*/!**
   * The start & end patterns must be pre/post fixed by a quiet zone. This
   * zone must be at least 10 times the width of a narrow line.  Scan back until
   * we either get to the start of the barcode or match the necessary number of
   * quiet zone pixels.
   *
   * Note: Its assumed the row is reversed when using this method to find
   * quiet zone after the end pattern.
   *
   * ref: http://www.barcode-1.net/i25code.html
   *
   * @param row bit array representing the scanned barcode.
   * @param startPattern index into row of the start or end pattern.
   * @throws NotFoundException if the quiet zone cannot be found
   *!/*/
  validateQuietZone(row, startPattern) {
    let quietCount = this.narrowLineWidth * 10;
    quietCount = quietCount < startPattern ? quietCount : startPattern;
    for (let i = startPattern - 1; quietCount > 0 && i >= 0; i--) {
      if (row.get(i)) {
        break;
      }
      quietCount--;
    }
    if (quietCount !== 0) {
      throw new NotFoundException.NotFoundException();
    }
  }
  /*
  /!**
   * Skip all whitespace until we get to the first black line.
   *
   * @param row row of black/white values to search
   * @return index of the first black line.
   * @throws NotFoundException Throws exception if no black lines are found in the row
   *!/*/
  static skipWhiteSpace(row) {
    const width = row.getSize();
    const endStart = row.getNextSet(0);
    if (endStart === width) {
      throw new NotFoundException.NotFoundException();
    }
    return endStart;
  }
  /*/!**
   * Identify where the end of the middle / payload section ends.
   *
   * @param row row of black/white values to search
   * @return Array, containing index of start of 'end block' and end of 'end
   *         block'
   *!/*/
  decodeEnd(row) {
    row.reverse();
    try {
      let endStart = ITFReader.skipWhiteSpace(row);
      let endPattern;
      try {
        endPattern = ITFReader.findGuardPattern(row, endStart, ITFReader.END_PATTERN_REVERSED[0]);
      } catch (error) {
        if (error instanceof NotFoundException.NotFoundException) {
          endPattern = ITFReader.findGuardPattern(row, endStart, ITFReader.END_PATTERN_REVERSED[1]);
        }
      }
      this.validateQuietZone(row, endPattern[0]);
      let temp = endPattern[0];
      endPattern[0] = row.getSize() - endPattern[1];
      endPattern[1] = row.getSize() - temp;
      return endPattern;
    } finally {
      row.reverse();
    }
  }
  /*
  /!**
   * @param row       row of black/white values to search
   * @param rowOffset position to start search
   * @param pattern   pattern of counts of number of black and white pixels that are
   *                  being searched for as a pattern
   * @return start/end horizontal offset of guard pattern, as an array of two
   *         ints
   * @throws NotFoundException if pattern is not found
   *!/*/
  static findGuardPattern(row, rowOffset, pattern) {
    let patternLength = pattern.length;
    let counters = new Int32Array(patternLength);
    let width = row.getSize();
    let isWhite = false;
    let counterPosition = 0;
    let patternStart = rowOffset;
    counters.fill(0);
    for (let x = rowOffset; x < width; x++) {
      if (row.get(x) !== isWhite) {
        counters[counterPosition]++;
      } else {
        if (counterPosition === patternLength - 1) {
          if (OneDReader.OneDReader.patternMatchVariance(counters, pattern, ITFReader.MAX_INDIVIDUAL_VARIANCE) < ITFReader.MAX_AVG_VARIANCE) {
            return [patternStart, x];
          }
          patternStart += counters[0] + counters[1];
          ZXingSystem.ZXingSystem.arraycopy(counters, 2, counters, 0, counterPosition - 1);
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
  /*/!**
   * Attempts to decode a sequence of ITF black/white lines into single
   * digit.
   *
   * @param counters the counts of runs of observed black/white/black/... values
   * @return The decoded digit
   * @throws NotFoundException if digit cannot be decoded
   *!/*/
  static decodeDigit(counters) {
    let bestVariance = ITFReader.MAX_AVG_VARIANCE;
    let bestMatch = -1;
    let max = ITFReader.PATTERNS.length;
    for (let i = 0; i < max; i++) {
      let pattern = ITFReader.PATTERNS[i];
      let variance = OneDReader.OneDReader.patternMatchVariance(counters, pattern, ITFReader.MAX_INDIVIDUAL_VARIANCE);
      if (variance < bestVariance) {
        bestVariance = variance;
        bestMatch = i;
      } else if (variance === bestVariance) {
        bestMatch = -1;
      }
    }
    if (bestMatch >= 0) {
      return bestMatch % 10;
    } else {
      throw new NotFoundException.NotFoundException();
    }
  }
}

exports.ITFReader = ITFReader;
//# sourceMappingURL=ITFReader.cjs.map
//# sourceMappingURL=ITFReader.cjs.map