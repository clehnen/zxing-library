import { ResultPoint } from '../../ResultPoint';
import { ZXingSystem } from '../../util/ZXingSystem';
import { ZXingArrays } from '../../util/ZXingArrays';
import { PDF417DetectorResult } from './PDF417DetectorResult';

class Detector {
  static INDEXES_START_PATTERN = Int32Array.from([0, 4, 1, 5]);
  static INDEXES_STOP_PATTERN = Int32Array.from([6, 2, 7, 3]);
  static MAX_AVG_VARIANCE = (
    /*0.42f*/
    0.42
  );
  static MAX_INDIVIDUAL_VARIANCE = (
    /*0.8f*/
    0.8
  );
  // B S B S B S B S Bar/Space pattern
  // 11111111 0 1 0 1 0 1 000
  static START_PATTERN = Int32Array.from([8, 1, 1, 1, 1, 1, 1, 3]);
  // 1111111 0 1 000 1 0 1 00 1
  static STOP_PATTERN = Int32Array.from([7, 1, 1, 3, 1, 1, 1, 2, 1]);
  static MAX_PIXEL_DRIFT = 3;
  static MAX_PATTERN_DRIFT = 5;
  // if we set the value too low, then we don't detect the correct height of the bar if the start patterns are damaged.
  // if we set the value too high, then we might detect the start pattern from a neighbor barcode.
  static SKIPPED_ROW_COUNT_MAX = 25;
  // A PDF471 barcode should have at least 3 rows, with each row being >= 3 times the module width. Therefore it should be at least
  // 9 pixels tall. To be conservative, we use about half the size to ensure we don't miss it.
  static ROW_STEP = 5;
  static BARCODE_MIN_HEIGHT = 10;
  /**
   * <p>Detects a PDF417 Code in an image. Only checks 0 and 180 degree rotations.</p>
   *
   * @param image barcode image to decode
   * @param hints optional hints to detector
   * @param multiple if true, then the image is searched for multiple codes. If false, then at most one code will
   * be found and returned
   * @return {@link PDF417DetectorResult} encapsulating results of detecting a PDF417 code
   * @throws NotFoundException if no PDF417 Code can be found
   */
  static detectMultiple(image, hints, multiple) {
    let bitMatrix = image.getBlackMatrix();
    let barcodeCoordinates = Detector.detect(multiple, bitMatrix);
    if (!barcodeCoordinates.length) {
      bitMatrix = bitMatrix.clone();
      bitMatrix.rotate180();
      barcodeCoordinates = Detector.detect(multiple, bitMatrix);
    }
    return new PDF417DetectorResult(bitMatrix, barcodeCoordinates);
  }
  /**
   * Detects PDF417 codes in an image. Only checks 0 degree rotation
   * @param multiple if true, then the image is searched for multiple codes. If false, then at most one code will
   * be found and returned
   * @param bitMatrix bit matrix to detect barcodes in
   * @return List of ResultPoint arrays containing the coordinates of found barcodes
   */
  static detect(multiple, bitMatrix) {
    const barcodeCoordinates = new Array();
    let row = 0;
    let column = 0;
    let foundBarcodeInRow = false;
    while (row < bitMatrix.getHeight()) {
      const vertices = Detector.findVertices(bitMatrix, row, column);
      if (vertices[0] == null && vertices[3] == null) {
        if (!foundBarcodeInRow) {
          break;
        }
        foundBarcodeInRow = false;
        column = 0;
        for (const barcodeCoordinate of barcodeCoordinates) {
          if (barcodeCoordinate[1] != null) {
            row = Math.trunc(Math.max(row, barcodeCoordinate[1].getY()));
          }
          if (barcodeCoordinate[3] != null) {
            row = Math.max(row, Math.trunc(barcodeCoordinate[3].getY()));
          }
        }
        row += Detector.ROW_STEP;
        continue;
      }
      foundBarcodeInRow = true;
      barcodeCoordinates.push(vertices);
      if (!multiple) {
        break;
      }
      if (vertices[2] != null) {
        column = Math.trunc(vertices[2].getX());
        row = Math.trunc(vertices[2].getY());
      } else {
        column = Math.trunc(vertices[4].getX());
        row = Math.trunc(vertices[4].getY());
      }
    }
    return barcodeCoordinates;
  }
  /**
   * Locate the vertices and the codewords area of a black blob using the Start
   * and Stop patterns as locators.
   *
   * @param matrix the scanned barcode image.
   * @return an array containing the vertices:
   *           vertices[0] x, y top left barcode
   *           vertices[1] x, y bottom left barcode
   *           vertices[2] x, y top right barcode
   *           vertices[3] x, y bottom right barcode
   *           vertices[4] x, y top left codeword area
   *           vertices[5] x, y bottom left codeword area
   *           vertices[6] x, y top right codeword area
   *           vertices[7] x, y bottom right codeword area
   */
  static findVertices(matrix, startRow, startColumn) {
    const height = matrix.getHeight();
    const width = matrix.getWidth();
    const result = new Array(8);
    Detector.copyToResult(
      result,
      Detector.findRowsWithPattern(matrix, height, width, startRow, startColumn, Detector.START_PATTERN),
      Detector.INDEXES_START_PATTERN
    );
    if (result[4] != null) {
      startColumn = Math.trunc(result[4].getX());
      startRow = Math.trunc(result[4].getY());
    }
    Detector.copyToResult(
      result,
      Detector.findRowsWithPattern(matrix, height, width, startRow, startColumn, Detector.STOP_PATTERN),
      Detector.INDEXES_STOP_PATTERN
    );
    return result;
  }
  static copyToResult(result, tmpResult, destinationIndexes) {
    for (let i = 0; i < destinationIndexes.length; i++) {
      result[destinationIndexes[i]] = tmpResult[i];
    }
  }
  static findRowsWithPattern(matrix, height, width, startRow, startColumn, pattern) {
    const result = new Array(4);
    let found = false;
    const counters = new Int32Array(pattern.length);
    for (; startRow < height; startRow += Detector.ROW_STEP) {
      let loc = Detector.findGuardPattern(matrix, startColumn, startRow, width, false, pattern, counters);
      if (loc != null) {
        while (startRow > 0) {
          const previousRowLoc = Detector.findGuardPattern(matrix, startColumn, --startRow, width, false, pattern, counters);
          if (previousRowLoc != null) {
            loc = previousRowLoc;
          } else {
            startRow++;
            break;
          }
        }
        result[0] = new ResultPoint(loc[0], startRow);
        result[1] = new ResultPoint(loc[1], startRow);
        found = true;
        break;
      }
    }
    let stopRow = startRow + 1;
    if (found) {
      let skippedRowCount = 0;
      let previousRowLoc = Int32Array.from([Math.trunc(result[0].getX()), Math.trunc(result[1].getX())]);
      for (; stopRow < height; stopRow++) {
        const loc = Detector.findGuardPattern(matrix, previousRowLoc[0], stopRow, width, false, pattern, counters);
        if (loc != null && Math.abs(previousRowLoc[0] - loc[0]) < Detector.MAX_PATTERN_DRIFT && Math.abs(previousRowLoc[1] - loc[1]) < Detector.MAX_PATTERN_DRIFT) {
          previousRowLoc = loc;
          skippedRowCount = 0;
        } else {
          if (skippedRowCount > Detector.SKIPPED_ROW_COUNT_MAX) {
            break;
          } else {
            skippedRowCount++;
          }
        }
      }
      stopRow -= skippedRowCount + 1;
      result[2] = new ResultPoint(previousRowLoc[0], stopRow);
      result[3] = new ResultPoint(previousRowLoc[1], stopRow);
    }
    if (stopRow - startRow < Detector.BARCODE_MIN_HEIGHT) {
      ZXingArrays.fill(result, null);
    }
    return result;
  }
  /**
   * @param matrix row of black/white values to search
   * @param column x position to start search
   * @param row y position to start search
   * @param width the number of pixels to search on this row
   * @param pattern pattern of counts of number of black and white pixels that are
   *                 being searched for as a pattern
   * @param counters array of counters, as long as pattern, to re-use
   * @return start/end horizontal offset of guard pattern, as an array of two ints.
   */
  static findGuardPattern(matrix, column, row, width, whiteFirst, pattern, counters) {
    ZXingArrays.fillWithin(counters, 0, counters.length, 0);
    let patternStart = column;
    let pixelDrift = 0;
    while (matrix.get(patternStart, row) && patternStart > 0 && pixelDrift++ < Detector.MAX_PIXEL_DRIFT) {
      patternStart--;
    }
    let x = patternStart;
    let counterPosition = 0;
    let patternLength = pattern.length;
    for (let isWhite = whiteFirst; x < width; x++) {
      let pixel = matrix.get(x, row);
      if (pixel !== isWhite) {
        counters[counterPosition]++;
      } else {
        if (counterPosition === patternLength - 1) {
          if (Detector.patternMatchVariance(counters, pattern, Detector.MAX_INDIVIDUAL_VARIANCE) < Detector.MAX_AVG_VARIANCE) {
            return new Int32Array([patternStart, x]);
          }
          patternStart += counters[0] + counters[1];
          ZXingSystem.arraycopy(counters, 2, counters, 0, counterPosition - 1);
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
    if (counterPosition === patternLength - 1 && Detector.patternMatchVariance(counters, pattern, Detector.MAX_INDIVIDUAL_VARIANCE) < Detector.MAX_AVG_VARIANCE) {
      return new Int32Array([patternStart, x - 1]);
    }
    return null;
  }
  /**
   * Determines how closely a set of observed counts of runs of black/white
   * values matches a given target pattern. This is reported as the ratio of
   * the total variance from the expected pattern proportions across all
   * pattern elements, to the length of the pattern.
   *
   * @param counters observed counters
   * @param pattern expected pattern
   * @param maxIndividualVariance The most any counter can differ before we give up
   * @return ratio of total variance between counters and pattern compared to total pattern size
   */
  static patternMatchVariance(counters, pattern, maxIndividualVariance) {
    let numCounters = counters.length;
    let total = 0;
    let patternLength = 0;
    for (let i = 0; i < numCounters; i++) {
      total += counters[i];
      patternLength += pattern[i];
    }
    if (total < patternLength) {
      return (
        /*Float.POSITIVE_INFINITY*/
        Infinity
      );
    }
    let unitBarWidth = total / patternLength;
    maxIndividualVariance *= unitBarWidth;
    let totalVariance = 0;
    for (let x = 0; x < numCounters; x++) {
      let counter = counters[x];
      let scaledPattern = pattern[x] * unitBarWidth;
      let variance = counter > scaledPattern ? counter - scaledPattern : scaledPattern - counter;
      if (variance > maxIndividualVariance) {
        return (
          /*Float.POSITIVE_INFINITY*/
          Infinity
        );
      }
      totalVariance += variance;
    }
    return totalVariance / total;
  }
}

export { Detector };
//# sourceMappingURL=Detector.js.map
//# sourceMappingURL=Detector.js.map