import { BarcodeFormat } from '../../../BarcodeFormat';
import { MathUtils } from '../../../common/detector/MathUtils';
import { NotFoundException } from '../../../NotFoundException';
import { Result } from '../../../Result';
import { ZXingSystem } from '../../../util/ZXingSystem';
import { AbstractRSSReader } from '../../rss/AbstractRSSReader';
import { DataCharacter } from '../../rss/DataCharacter';
import { FinderPattern } from '../../rss/FinderPattern';
import { RSSUtils } from '../../rss/RSSUtils';
import { BitArrayBuilder } from './BitArrayBuilder';
import { createAbstractExpandedDecoder } from './decoders/AbstractExpandedDecoderComplement';
import { ExpandedPair } from './ExpandedPair';
import { ExpandedRow } from './ExpandedRow';

class RSSExpandedReader extends AbstractRSSReader {
  static SYMBOL_WIDEST = [7, 5, 4, 3, 1];
  static EVEN_TOTAL_SUBSET = [4, 20, 52, 104, 204];
  static GSUM = [0, 348, 1388, 2948, 3988];
  static FINDER_PATTERNS = [
    Int32Array.from([1, 8, 4, 1]),
    // A
    Int32Array.from([3, 6, 4, 1]),
    // B
    Int32Array.from([3, 4, 6, 1]),
    // C
    Int32Array.from([3, 2, 8, 1]),
    // D
    Int32Array.from([2, 6, 5, 1]),
    // E
    Int32Array.from([2, 2, 9, 1])
    // F
  ];
  static WEIGHTS = [
    [1, 3, 9, 27, 81, 32, 96, 77],
    [20, 60, 180, 118, 143, 7, 21, 63],
    [189, 145, 13, 39, 117, 140, 209, 205],
    [193, 157, 49, 147, 19, 57, 171, 91],
    [62, 186, 136, 197, 169, 85, 44, 132],
    [185, 133, 188, 142, 4, 12, 36, 108],
    [113, 128, 173, 97, 80, 29, 87, 50],
    [150, 28, 84, 41, 123, 158, 52, 156],
    [46, 138, 203, 187, 139, 206, 196, 166],
    [76, 17, 51, 153, 37, 111, 122, 155],
    [43, 129, 176, 106, 107, 110, 119, 146],
    [16, 48, 144, 10, 30, 90, 59, 177],
    [109, 116, 137, 200, 178, 112, 125, 164],
    [70, 210, 208, 202, 184, 130, 179, 115],
    [134, 191, 151, 31, 93, 68, 204, 190],
    [148, 22, 66, 198, 172, 94, 71, 2],
    [6, 18, 54, 162, 64, 192, 154, 40],
    [120, 149, 25, 75, 14, 42, 126, 167],
    [79, 26, 78, 23, 69, 207, 199, 175],
    [103, 98, 83, 38, 114, 131, 182, 124],
    [161, 61, 183, 127, 170, 88, 53, 159],
    [55, 165, 73, 8, 24, 72, 5, 15],
    [45, 135, 194, 160, 58, 174, 100, 89]
  ];
  static FINDER_PAT_A = 0;
  static FINDER_PAT_B = 1;
  static FINDER_PAT_C = 2;
  static FINDER_PAT_D = 3;
  static FINDER_PAT_E = 4;
  static FINDER_PAT_F = 5;
  static FINDER_PATTERN_SEQUENCES = [
    [RSSExpandedReader.FINDER_PAT_A, RSSExpandedReader.FINDER_PAT_A],
    [
      RSSExpandedReader.FINDER_PAT_A,
      RSSExpandedReader.FINDER_PAT_B,
      RSSExpandedReader.FINDER_PAT_B
    ],
    [
      RSSExpandedReader.FINDER_PAT_A,
      RSSExpandedReader.FINDER_PAT_C,
      RSSExpandedReader.FINDER_PAT_B,
      RSSExpandedReader.FINDER_PAT_D
    ],
    [
      RSSExpandedReader.FINDER_PAT_A,
      RSSExpandedReader.FINDER_PAT_E,
      RSSExpandedReader.FINDER_PAT_B,
      RSSExpandedReader.FINDER_PAT_D,
      RSSExpandedReader.FINDER_PAT_C
    ],
    [
      RSSExpandedReader.FINDER_PAT_A,
      RSSExpandedReader.FINDER_PAT_E,
      RSSExpandedReader.FINDER_PAT_B,
      RSSExpandedReader.FINDER_PAT_D,
      RSSExpandedReader.FINDER_PAT_D,
      RSSExpandedReader.FINDER_PAT_F
    ],
    [
      RSSExpandedReader.FINDER_PAT_A,
      RSSExpandedReader.FINDER_PAT_E,
      RSSExpandedReader.FINDER_PAT_B,
      RSSExpandedReader.FINDER_PAT_D,
      RSSExpandedReader.FINDER_PAT_E,
      RSSExpandedReader.FINDER_PAT_F,
      RSSExpandedReader.FINDER_PAT_F
    ],
    [
      RSSExpandedReader.FINDER_PAT_A,
      RSSExpandedReader.FINDER_PAT_A,
      RSSExpandedReader.FINDER_PAT_B,
      RSSExpandedReader.FINDER_PAT_B,
      RSSExpandedReader.FINDER_PAT_C,
      RSSExpandedReader.FINDER_PAT_C,
      RSSExpandedReader.FINDER_PAT_D,
      RSSExpandedReader.FINDER_PAT_D
    ],
    [
      RSSExpandedReader.FINDER_PAT_A,
      RSSExpandedReader.FINDER_PAT_A,
      RSSExpandedReader.FINDER_PAT_B,
      RSSExpandedReader.FINDER_PAT_B,
      RSSExpandedReader.FINDER_PAT_C,
      RSSExpandedReader.FINDER_PAT_C,
      RSSExpandedReader.FINDER_PAT_D,
      RSSExpandedReader.FINDER_PAT_E,
      RSSExpandedReader.FINDER_PAT_E
    ],
    [
      RSSExpandedReader.FINDER_PAT_A,
      RSSExpandedReader.FINDER_PAT_A,
      RSSExpandedReader.FINDER_PAT_B,
      RSSExpandedReader.FINDER_PAT_B,
      RSSExpandedReader.FINDER_PAT_C,
      RSSExpandedReader.FINDER_PAT_C,
      RSSExpandedReader.FINDER_PAT_D,
      RSSExpandedReader.FINDER_PAT_E,
      RSSExpandedReader.FINDER_PAT_F,
      RSSExpandedReader.FINDER_PAT_F
    ],
    [
      RSSExpandedReader.FINDER_PAT_A,
      RSSExpandedReader.FINDER_PAT_A,
      RSSExpandedReader.FINDER_PAT_B,
      RSSExpandedReader.FINDER_PAT_B,
      RSSExpandedReader.FINDER_PAT_C,
      RSSExpandedReader.FINDER_PAT_D,
      RSSExpandedReader.FINDER_PAT_D,
      RSSExpandedReader.FINDER_PAT_E,
      RSSExpandedReader.FINDER_PAT_E,
      RSSExpandedReader.FINDER_PAT_F,
      RSSExpandedReader.FINDER_PAT_F
    ]
  ];
  static MAX_PAIRS = 11;
  static FINDER_PATTERN_MODULES = 15;
  static DATA_CHARACTER_MODULES = 17;
  static MAX_FINDER_PATTERN_DISTANCE_VARIANCE = 0.1;
  pairs = new Array(RSSExpandedReader.MAX_PAIRS);
  rows = new Array();
  startEnd = [0, 0];
  startFromEven = false;
  decodeRow(rowNumber, row, hints) {
    this.startFromEven = false;
    try {
      return RSSExpandedReader.constructResult(
        this.decodeRow2pairs(rowNumber, row)
      );
    } catch (ex) {
      if (ex instanceof NotFoundException) ; else {
        throw ex;
      }
    }
    this.startFromEven = true;
    return RSSExpandedReader.constructResult(
      this.decodeRow2pairs(rowNumber, row)
    );
  }
  reset() {
    this.pairs.length = 0;
    this.rows.length = 0;
  }
  // Not private for testing
  decodeRow2pairs(rowNumber, row) {
    this.pairs.length = 0;
    let done = false;
    while (!done) {
      try {
        this.pairs.push(this.retrieveNextPair(row, this.pairs, rowNumber));
      } catch (error) {
        if (error instanceof NotFoundException) {
          if (this.pairs.length === 0) {
            throw error;
          }
          done = true;
        } else {
          throw error;
        }
      }
    }
    if (this.checkChecksum() && RSSExpandedReader.isValidSequence(this.pairs, true)) {
      return this.pairs;
    }
    let tryStackedDecode = this.rows.length > 0;
    this.storeRow(rowNumber);
    if (tryStackedDecode) {
      let ps = this.checkRowsBoolean(false);
      if (ps !== null) {
        return ps;
      }
      ps = this.checkRowsBoolean(true);
      if (ps !== null) {
        return ps;
      }
    }
    throw new NotFoundException();
  }
  checkRowsBoolean(reverse) {
    if (this.rows.length > 25) {
      this.rows.length = 0;
      return null;
    }
    this.pairs.length = 0;
    if (reverse) {
      this.rows.reverse();
    }
    let ps = null;
    try {
      ps = this.checkRows(new Array(), 0);
    } catch (ex) {
      if (ex instanceof NotFoundException) ; else {
        throw ex;
      }
    }
    if (reverse) {
      this.rows.reverse();
    }
    return ps;
  }
  // Try to construct a valid rows sequence
  // Recursion is used to implement backtracking
  checkRows(collectedRows, currentRow) {
    for (let i = currentRow; i < this.rows.length; i++) {
      const row = this.rows[i];
      this.pairs.push(...row.getPairs());
      const addSize = row.getPairs().length;
      if (RSSExpandedReader.isValidSequence(this.pairs, false)) {
        if (this.checkChecksum()) {
          return this.pairs;
        }
        collectedRows.push(row);
        try {
          return this.checkRows(collectedRows, i + 1);
        } catch (ex) {
          if (ex instanceof NotFoundException) {
            collectedRows.pop();
            this.pairs.splice(this.pairs.length - addSize, addSize);
          } else {
            throw ex;
          }
        }
      } else {
        this.pairs.splice(this.pairs.length - addSize, addSize);
      }
    }
    throw new NotFoundException();
  }
  // Whether the pairs form a valid finder pattern sequence, either complete or a prefix
  static isValidSequence(pairs, complete) {
    for (const sequence of RSSExpandedReader.FINDER_PATTERN_SEQUENCES) {
      const sizeOk = complete ? pairs.length === sequence.length : pairs.length <= sequence.length;
      if (sizeOk) {
        let stop = true;
        for (let j = 0; j < pairs.length; j++) {
          if (pairs[j].getFinderPattern().getValue() !== sequence[j]) {
            stop = false;
            break;
          }
        }
        if (stop) {
          return true;
        }
      }
    }
    return false;
  }
  // Whether the pairs, plus another pair of the specified type, would together
  // form a valid finder pattern sequence, either complete or partial
  static mayFollow(pairs, value) {
    if (pairs.length === 0) {
      return true;
    }
    for (const sequence of this.FINDER_PATTERN_SEQUENCES) {
      if (pairs.length + 1 <= sequence.length) {
        for (let i = pairs.length; i < sequence.length; i++) {
          if (sequence[i] === value) {
            let matched = true;
            for (let j = 0; j < pairs.length; j++) {
              const allowed = sequence[i - j - 1];
              const actual = pairs[pairs.length - j - 1].getFinderPattern().getValue();
              if (allowed !== actual) {
                matched = false;
                break;
              }
            }
            if (matched) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }
  storeRow(rowNumber) {
    let insertPos = 0;
    let prevIsSame = false;
    let nextIsSame = false;
    while (insertPos < this.rows.length) {
      const erow = this.rows[insertPos];
      if (erow.getRowNumber() > rowNumber) {
        nextIsSame = erow.isEquivalent(this.pairs);
        break;
      }
      prevIsSame = erow.isEquivalent(this.pairs);
      insertPos++;
    }
    if (nextIsSame || prevIsSame) {
      return;
    }
    if (RSSExpandedReader.isPartialRow(this.pairs, this.rows)) {
      return;
    }
    this.rows.splice(insertPos, 0, new ExpandedRow(this.pairs, rowNumber));
    this.removePartialRows(this.pairs, this.rows);
  }
  // Remove all the rows that contains only specified pairs
  removePartialRows(pairs, rows) {
    for (let rowsIndex = rows.length - 1; rowsIndex >= 0; rowsIndex--) {
      const r = rows[rowsIndex];
      if (r.getPairs().length !== pairs.length) {
        let allFound = true;
        for (const p of r.getPairs()) {
          if (!pairs.some((otherPair) => ExpandedPair.equals(p, otherPair))) {
            allFound = false;
            break;
          }
        }
        if (allFound) {
          rows.splice(rowsIndex, 1);
        }
      }
    }
  }
  // Returns true when one of the rows already contains all the pairs
  static isPartialRow(pairs, rows) {
    for (const r of rows) {
      let allFound = true;
      for (const p of pairs) {
        let found = false;
        for (const pp of r.getPairs()) {
          if (ExpandedPair.equals(p, pp)) {
            found = true;
            break;
          }
        }
        if (!found) {
          allFound = false;
          break;
        }
      }
      if (allFound) {
        return true;
      }
    }
    return false;
  }
  // Only used for unit testing
  getRows() {
    return this.rows;
  }
  // Not private for unit testing
  static constructResult(pairs) {
    const binary = BitArrayBuilder.buildBitArray(pairs);
    const decoder = createAbstractExpandedDecoder(binary);
    const resultingString = decoder.parseInformation();
    const firstPoints = pairs[0].getFinderPattern().getResultPoints();
    const lastPoints = pairs[pairs.length - 1].getFinderPattern().getResultPoints();
    const points = [firstPoints[0], firstPoints[1], lastPoints[0], lastPoints[1]];
    return new Result(
      resultingString,
      null,
      null,
      points,
      BarcodeFormat.RSS_EXPANDED,
      null
    );
  }
  checkChecksum() {
    const firstPair = this.pairs[0];
    const checkCharacter = firstPair.getLeftChar();
    const firstCharacter = firstPair.getRightChar();
    if (firstCharacter === null) {
      return false;
    }
    let checksum = firstCharacter.getChecksumPortion();
    let s = 2;
    for (let i = 1; i < this.pairs.length; ++i) {
      const currentPair = this.pairs[i];
      checksum += currentPair.getLeftChar().getChecksumPortion();
      s++;
      const currentRightChar = currentPair.getRightChar();
      if (currentRightChar !== null) {
        checksum += currentRightChar.getChecksumPortion();
        s++;
      }
    }
    checksum %= 211;
    const checkCharacterValue = 211 * (s - 4) + checksum;
    return checkCharacterValue === checkCharacter.getValue();
  }
  static getNextSecondBar(row, initialPos) {
    let currentPos = 0;
    if (row.get(initialPos)) {
      currentPos = row.getNextUnset(initialPos);
      currentPos = row.getNextSet(currentPos);
    } else {
      currentPos = row.getNextSet(initialPos);
      currentPos = row.getNextUnset(currentPos);
    }
    return currentPos;
  }
  // not private for testing
  retrieveNextPair(row, previousPairs, rowNumber) {
    let isOddPattern = previousPairs.length % 2 === 0;
    if (this.startFromEven) {
      isOddPattern = !isOddPattern;
    }
    let pattern = null;
    let leftChar = null;
    let keepFinding = true;
    let forcedOffset = -1;
    do {
      this.findNextPair(row, previousPairs, forcedOffset);
      pattern = this.parseFoundFinderPattern(row, rowNumber, isOddPattern, previousPairs);
      if (pattern === null) {
        forcedOffset = RSSExpandedReader.getNextSecondBar(row, this.startEnd[0]);
      } else {
        try {
          leftChar = this.decodeDataCharacter(row, pattern, isOddPattern, true);
          keepFinding = false;
        } catch (ex) {
          if (ex instanceof NotFoundException) {
            forcedOffset = RSSExpandedReader.getNextSecondBar(row, this.startEnd[0]);
          } else {
            throw ex;
          }
        }
      }
    } while (keepFinding);
    if (previousPairs.length > 0 && previousPairs[previousPairs.length - 1].mustBeLast()) {
      throw new NotFoundException();
    }
    let rightChar = null;
    try {
      rightChar = this.decodeDataCharacter(row, pattern, isOddPattern, false);
    } catch (ex) {
      if (ex instanceof NotFoundException) {
        rightChar = null;
      } else {
        throw ex;
      }
    }
    return new ExpandedPair(leftChar, rightChar, pattern);
  }
  findNextPair(row, previousPairs, forcedOffset) {
    const counters = this.getDecodeFinderCounters();
    counters[0] = 0;
    counters[1] = 0;
    counters[2] = 0;
    counters[3] = 0;
    let width = row.getSize();
    let rowOffset = 0;
    if (forcedOffset >= 0) {
      rowOffset = forcedOffset;
    } else if (previousPairs.length === 0) {
      rowOffset = 0;
    } else {
      const lastPair = previousPairs[previousPairs.length - 1];
      rowOffset = lastPair.getFinderPattern().getStartEnd()[1];
    }
    let searchingEvenPair = previousPairs.length % 2 !== 0;
    if (this.startFromEven) {
      searchingEvenPair = !searchingEvenPair;
    }
    let isWhite = false;
    while (rowOffset < width) {
      isWhite = !row.get(rowOffset);
      if (!isWhite) {
        break;
      }
      rowOffset++;
    }
    let counterPosition = 0;
    let patternStart = rowOffset;
    for (let x = rowOffset; x < width; x++) {
      if (row.get(x) !== isWhite) {
        counters[counterPosition]++;
      } else {
        if (counterPosition === 3) {
          if (searchingEvenPair) {
            RSSExpandedReader.reverseCounters(counters);
          }
          if (RSSExpandedReader.isFinderPattern(counters)) {
            this.startEnd[0] = patternStart;
            this.startEnd[1] = x;
            return;
          }
          if (searchingEvenPair) {
            RSSExpandedReader.reverseCounters(counters);
          }
          patternStart += counters[0] + counters[1];
          counters[0] = counters[2];
          counters[1] = counters[3];
          counters[2] = 0;
          counters[3] = 0;
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
  static reverseCounters(counters) {
    const length = counters.length;
    for (let i = 0; i < Math.trunc(length / 2); ++i) {
      const tmp = counters[i];
      counters[i] = counters[length - i - 1];
      counters[length - i - 1] = tmp;
    }
  }
  parseFoundFinderPattern(row, rowNumber, oddPattern, previousPairs) {
    let firstCounter = 0;
    let start = 0;
    let end = 0;
    if (oddPattern) {
      let firstElementStart = this.startEnd[0] - 1;
      while (firstElementStart >= 0 && !row.get(firstElementStart)) {
        firstElementStart--;
      }
      firstElementStart++;
      firstCounter = this.startEnd[0] - firstElementStart;
      start = firstElementStart;
      end = this.startEnd[1];
    } else {
      start = this.startEnd[0];
      end = row.getNextUnset(this.startEnd[1] + 1);
      firstCounter = end - this.startEnd[1];
    }
    const counters = this.getDecodeFinderCounters();
    ZXingSystem.arraycopy(counters, 0, counters, 1, counters.length - 1);
    counters[0] = firstCounter;
    let value = 0;
    try {
      value = this.parseFinderValue(counters, RSSExpandedReader.FINDER_PATTERNS);
    } catch (ex) {
      if (ex instanceof NotFoundException) {
        return null;
      } else {
        throw ex;
      }
    }
    if (!RSSExpandedReader.mayFollow(previousPairs, value)) {
      return null;
    }
    if (previousPairs.length > 0) {
      const prev = previousPairs[previousPairs.length - 1];
      const prevStart = prev.getFinderPattern().getStartEnd()[0];
      const prevEnd = prev.getFinderPattern().getStartEnd()[1];
      const prevWidth = prevEnd - prevStart;
      const charWidth = prevWidth / /* float */
      RSSExpandedReader.FINDER_PATTERN_MODULES * RSSExpandedReader.DATA_CHARACTER_MODULES;
      const minX = prevEnd + 2 * charWidth * (1 - RSSExpandedReader.MAX_FINDER_PATTERN_DISTANCE_VARIANCE);
      const maxX = prevEnd + 2 * charWidth * (1 + RSSExpandedReader.MAX_FINDER_PATTERN_DISTANCE_VARIANCE);
      if (start < minX || start > maxX) {
        return null;
      }
    }
    return new FinderPattern(value, [start, end], start, end, rowNumber);
  }
  decodeDataCharacter(row, pattern, isOddPattern, leftChar) {
    const counters = this.getDataCharacterCounters();
    for (let x = 0; x < counters.length; x++) {
      counters[x] = 0;
    }
    if (leftChar) {
      RSSExpandedReader.recordPatternInReverse(
        row,
        pattern.getStartEnd()[0],
        counters
      );
    } else {
      RSSExpandedReader.recordPattern(row, pattern.getStartEnd()[1], counters);
      for (let i = 0, j = counters.length - 1; i < j; i++, j--) {
        const temp = counters[i];
        counters[i] = counters[j];
        counters[j] = temp;
      }
    }
    let numModules = 17;
    let elementWidth = MathUtils.sum(new Int32Array(counters)) / numModules;
    let expectedElementWidth = (pattern.getStartEnd()[1] - pattern.getStartEnd()[0]) / 15;
    if (Math.abs(elementWidth - expectedElementWidth) / expectedElementWidth > 0.3) {
      throw new NotFoundException();
    }
    const oddCounts = this.getOddCounts();
    const evenCounts = this.getEvenCounts();
    const oddRoundingErrors = this.getOddRoundingErrors();
    const evenRoundingErrors = this.getEvenRoundingErrors();
    for (let i = 0; i < counters.length; i++) {
      const value2 = 1 * counters[i] / elementWidth;
      let count = Math.trunc(value2 + 0.5);
      if (count < 1) {
        if (value2 < 0.3) {
          throw new NotFoundException();
        }
        count = 1;
      } else if (count > 8) {
        if (value2 > 8.7) {
          throw new NotFoundException();
        }
        count = 8;
      }
      const offset = Math.trunc(i / 2);
      if ((i & 1) === 0) {
        oddCounts[offset] = count;
        oddRoundingErrors[offset] = value2 - count;
      } else {
        evenCounts[offset] = count;
        evenRoundingErrors[offset] = value2 - count;
      }
    }
    this.adjustOddEvenCounts(numModules);
    let weightRowNumber = 4 * pattern.getValue() + (isOddPattern ? 0 : 2) + (leftChar ? 0 : 1) - 1;
    let oddSum = 0;
    let oddChecksumPortion = 0;
    for (let i = oddCounts.length - 1; i >= 0; i--) {
      if (RSSExpandedReader.isNotA1left(pattern, isOddPattern, leftChar)) {
        const weight = RSSExpandedReader.WEIGHTS[weightRowNumber][2 * i];
        oddChecksumPortion += oddCounts[i] * weight;
      }
      oddSum += oddCounts[i];
    }
    let evenChecksumPortion = 0;
    for (let i = evenCounts.length - 1; i >= 0; i--) {
      if (RSSExpandedReader.isNotA1left(pattern, isOddPattern, leftChar)) {
        const weight = RSSExpandedReader.WEIGHTS[weightRowNumber][2 * i + 1];
        evenChecksumPortion += evenCounts[i] * weight;
      }
    }
    let checksumPortion = oddChecksumPortion + evenChecksumPortion;
    if ((oddSum & 1) !== 0 || oddSum > 13 || oddSum < 4) {
      throw new NotFoundException();
    }
    const group = Math.trunc((13 - oddSum) / 2);
    const oddWidest = RSSExpandedReader.SYMBOL_WIDEST[group];
    const evenWidest = 9 - oddWidest;
    const vOdd = RSSUtils.getRSSvalue(oddCounts, oddWidest, true);
    const vEven = RSSUtils.getRSSvalue(evenCounts, evenWidest, false);
    const tEven = RSSExpandedReader.EVEN_TOTAL_SUBSET[group];
    const gSum = RSSExpandedReader.GSUM[group];
    const value = vOdd * tEven + vEven + gSum;
    return new DataCharacter(value, checksumPortion);
  }
  static isNotA1left(pattern, isOddPattern, leftChar) {
    return !(pattern.getValue() === 0 && isOddPattern && leftChar);
  }
  adjustOddEvenCounts(numModules) {
    const oddSum = MathUtils.sum(new Int32Array(this.getOddCounts()));
    const evenSum = MathUtils.sum(new Int32Array(this.getEvenCounts()));
    let incrementOdd = false;
    let decrementOdd = false;
    if (oddSum > 13) {
      decrementOdd = true;
    } else if (oddSum < 4) {
      incrementOdd = true;
    }
    let incrementEven = false;
    let decrementEven = false;
    if (evenSum > 13) {
      decrementEven = true;
    } else if (evenSum < 4) {
      incrementEven = true;
    }
    let mismatch = oddSum + evenSum - numModules;
    let oddParityBad = (oddSum & 1) === 1;
    let evenParityBad = (evenSum & 1) === 0;
    if (mismatch === 1) {
      if (oddParityBad) {
        if (evenParityBad) {
          throw new NotFoundException();
        }
        decrementOdd = true;
      } else {
        if (!evenParityBad) {
          throw new NotFoundException();
        }
        decrementEven = true;
      }
    } else if (mismatch === -1) {
      if (oddParityBad) {
        if (evenParityBad) {
          throw new NotFoundException();
        }
        incrementOdd = true;
      } else {
        if (!evenParityBad) {
          throw new NotFoundException();
        }
        incrementEven = true;
      }
    } else if (mismatch === 0) {
      if (oddParityBad) {
        if (!evenParityBad) {
          throw new NotFoundException();
        }
        if (oddSum < evenSum) {
          incrementOdd = true;
          decrementEven = true;
        } else {
          decrementOdd = true;
          incrementEven = true;
        }
      } else {
        if (evenParityBad) {
          throw new NotFoundException();
        }
      }
    } else {
      throw new NotFoundException();
    }
    if (incrementOdd) {
      if (decrementOdd) {
        throw new NotFoundException();
      }
      RSSExpandedReader.increment(
        this.getOddCounts(),
        this.getOddRoundingErrors()
      );
    }
    if (decrementOdd) {
      RSSExpandedReader.decrement(
        this.getOddCounts(),
        this.getOddRoundingErrors()
      );
    }
    if (incrementEven) {
      if (decrementEven) {
        throw new NotFoundException();
      }
      RSSExpandedReader.increment(
        this.getEvenCounts(),
        this.getOddRoundingErrors()
      );
    }
    if (decrementEven) {
      RSSExpandedReader.decrement(
        this.getEvenCounts(),
        this.getEvenRoundingErrors()
      );
    }
  }
}

export { RSSExpandedReader };
//# sourceMappingURL=RSSExpandedReader.js.map
//# sourceMappingURL=RSSExpandedReader.js.map