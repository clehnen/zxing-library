import { ChecksumException } from '../../ChecksumException';
import { FormatException } from '../../FormatException';
import { NotFoundException } from '../../NotFoundException';
import { MathUtils } from '../../common/detector/MathUtils';
import { PDF417Common } from '../PDF417Common';
import { PDF417DecoderErrorCorrection } from './ec/PDF417DecoderErrorCorrection';
import { BoundingBox } from './BoundingBox';
import { DetectionResultRowIndicatorColumn } from './DetectionResultRowIndicatorColumn';
import { DetectionResult } from './DetectionResult';
import { DetectionResultColumn } from './DetectionResultColumn';
import { Codeword } from './Codeword';
import { BarcodeValue } from './BarcodeValue';
import { PDF417CodewordDecoder } from './PDF417CodewordDecoder';
import { PDF417DecodedBitStreamParser } from './PDF417DecodedBitStreamParser';
import { Formatter } from '../../util/Formatter';

class PDF417ScanningDecoder {
  /*final*/
  static CODEWORD_SKEW_SIZE = 2;
  /*final*/
  static MAX_ERRORS = 3;
  /*final*/
  static MAX_EC_CODEWORDS = 512;
  /*final*/
  static errorCorrection = new PDF417DecoderErrorCorrection();
  constructor() {
  }
  /**
   * @TODO don't pass in minCodewordWidth and maxCodewordWidth, pass in barcode columns for start and stop pattern
   *
   * columns. That way width can be deducted from the pattern column.
   * This approach also allows to detect more details about the barcode, e.g. if a bar type (white or black) is wider
   * than it should be. This can happen if the scanner used a bad blackpoint.
   *
   * @param BitMatrix
   * @param image
   * @param ResultPoint
   * @param imageTopLeft
   * @param ResultPoint
   * @param imageBottomLeft
   * @param ResultPoint
   * @param imageTopRight
   * @param ResultPoint
   * @param imageBottomRight
   * @param int
   * @param minCodewordWidth
   * @param int
   * @param maxCodewordWidth
   *
   * @throws NotFoundException
   * @throws FormatException
   * @throws ChecksumException
   */
  static decode(image, imageTopLeft, imageBottomLeft, imageTopRight, imageBottomRight, minCodewordWidth, maxCodewordWidth) {
    let boundingBox = new BoundingBox(image, imageTopLeft, imageBottomLeft, imageTopRight, imageBottomRight);
    let leftRowIndicatorColumn = null;
    let rightRowIndicatorColumn = null;
    let detectionResult;
    for (let firstPass = true; ; firstPass = false) {
      if (imageTopLeft != null) {
        leftRowIndicatorColumn = PDF417ScanningDecoder.getRowIndicatorColumn(
          image,
          boundingBox,
          imageTopLeft,
          true,
          minCodewordWidth,
          maxCodewordWidth
        );
      }
      if (imageTopRight != null) {
        rightRowIndicatorColumn = PDF417ScanningDecoder.getRowIndicatorColumn(
          image,
          boundingBox,
          imageTopRight,
          false,
          minCodewordWidth,
          maxCodewordWidth
        );
      }
      detectionResult = PDF417ScanningDecoder.merge(leftRowIndicatorColumn, rightRowIndicatorColumn);
      if (detectionResult == null) {
        throw NotFoundException.getNotFoundInstance();
      }
      let resultBox = detectionResult.getBoundingBox();
      if (firstPass && resultBox != null && (resultBox.getMinY() < boundingBox.getMinY() || resultBox.getMaxY() > boundingBox.getMaxY())) {
        boundingBox = resultBox;
      } else {
        break;
      }
    }
    detectionResult.setBoundingBox(boundingBox);
    let maxBarcodeColumn = detectionResult.getBarcodeColumnCount() + 1;
    detectionResult.setDetectionResultColumn(0, leftRowIndicatorColumn);
    detectionResult.setDetectionResultColumn(maxBarcodeColumn, rightRowIndicatorColumn);
    let leftToRight = leftRowIndicatorColumn != null;
    for (let barcodeColumnCount = 1; barcodeColumnCount <= maxBarcodeColumn; barcodeColumnCount++) {
      let barcodeColumn = leftToRight ? barcodeColumnCount : maxBarcodeColumn - barcodeColumnCount;
      if (detectionResult.getDetectionResultColumn(barcodeColumn) !== /* null */
      void 0) {
        continue;
      }
      let detectionResultColumn;
      if (barcodeColumn === 0 || barcodeColumn === maxBarcodeColumn) {
        detectionResultColumn = new DetectionResultRowIndicatorColumn(boundingBox, barcodeColumn === 0);
      } else {
        detectionResultColumn = new DetectionResultColumn(boundingBox);
      }
      detectionResult.setDetectionResultColumn(barcodeColumn, detectionResultColumn);
      let startColumn = -1;
      let previousStartColumn = startColumn;
      for (let imageRow = boundingBox.getMinY(); imageRow <= boundingBox.getMaxY(); imageRow++) {
        startColumn = PDF417ScanningDecoder.getStartColumn(detectionResult, barcodeColumn, imageRow, leftToRight);
        if (startColumn < 0 || startColumn > boundingBox.getMaxX()) {
          if (previousStartColumn === -1) {
            continue;
          }
          startColumn = previousStartColumn;
        }
        let codeword = PDF417ScanningDecoder.detectCodeword(
          image,
          boundingBox.getMinX(),
          boundingBox.getMaxX(),
          leftToRight,
          startColumn,
          imageRow,
          minCodewordWidth,
          maxCodewordWidth
        );
        if (codeword != null) {
          detectionResultColumn.setCodeword(imageRow, codeword);
          previousStartColumn = startColumn;
          minCodewordWidth = Math.min(minCodewordWidth, codeword.getWidth());
          maxCodewordWidth = Math.max(maxCodewordWidth, codeword.getWidth());
        }
      }
    }
    return PDF417ScanningDecoder.createDecoderResult(detectionResult);
  }
  /**
   *
   * @param leftRowIndicatorColumn
   * @param rightRowIndicatorColumn
   *
   * @throws NotFoundException
   */
  static merge(leftRowIndicatorColumn, rightRowIndicatorColumn) {
    if (leftRowIndicatorColumn == null && rightRowIndicatorColumn == null) {
      return null;
    }
    let barcodeMetadata = PDF417ScanningDecoder.getBarcodeMetadata(leftRowIndicatorColumn, rightRowIndicatorColumn);
    if (barcodeMetadata == null) {
      return null;
    }
    let boundingBox = BoundingBox.merge(
      PDF417ScanningDecoder.adjustBoundingBox(leftRowIndicatorColumn),
      PDF417ScanningDecoder.adjustBoundingBox(rightRowIndicatorColumn)
    );
    return new DetectionResult(barcodeMetadata, boundingBox);
  }
  /**
   *
   * @param rowIndicatorColumn
   *
   * @throws NotFoundException
   */
  static adjustBoundingBox(rowIndicatorColumn) {
    if (rowIndicatorColumn == null) {
      return null;
    }
    let rowHeights = rowIndicatorColumn.getRowHeights();
    if (rowHeights == null) {
      return null;
    }
    let maxRowHeight = PDF417ScanningDecoder.getMax(rowHeights);
    let missingStartRows = 0;
    for (let rowHeight of rowHeights) {
      missingStartRows += maxRowHeight - rowHeight;
      if (rowHeight > 0) {
        break;
      }
    }
    let codewords = rowIndicatorColumn.getCodewords();
    for (let row = 0; missingStartRows > 0 && codewords[row] == null; row++) {
      missingStartRows--;
    }
    let missingEndRows = 0;
    for (let row = rowHeights.length - 1; row >= 0; row--) {
      missingEndRows += maxRowHeight - rowHeights[row];
      if (rowHeights[row] > 0) {
        break;
      }
    }
    for (let row = codewords.length - 1; missingEndRows > 0 && codewords[row] == null; row--) {
      missingEndRows--;
    }
    return rowIndicatorColumn.getBoundingBox().addMissingRows(
      missingStartRows,
      missingEndRows,
      rowIndicatorColumn.isLeft()
    );
  }
  static getMax(values) {
    let maxValue = -1;
    for (let value of values) {
      maxValue = Math.max(maxValue, value);
    }
    return maxValue;
  }
  static getBarcodeMetadata(leftRowIndicatorColumn, rightRowIndicatorColumn) {
    let leftBarcodeMetadata;
    if (leftRowIndicatorColumn == null || (leftBarcodeMetadata = leftRowIndicatorColumn.getBarcodeMetadata()) == null) {
      return rightRowIndicatorColumn == null ? null : rightRowIndicatorColumn.getBarcodeMetadata();
    }
    let rightBarcodeMetadata;
    if (rightRowIndicatorColumn == null || (rightBarcodeMetadata = rightRowIndicatorColumn.getBarcodeMetadata()) == null) {
      return leftBarcodeMetadata;
    }
    if (leftBarcodeMetadata.getColumnCount() !== rightBarcodeMetadata.getColumnCount() && leftBarcodeMetadata.getErrorCorrectionLevel() !== rightBarcodeMetadata.getErrorCorrectionLevel() && leftBarcodeMetadata.getRowCount() !== rightBarcodeMetadata.getRowCount()) {
      return null;
    }
    return leftBarcodeMetadata;
  }
  static getRowIndicatorColumn(image, boundingBox, startPoint, leftToRight, minCodewordWidth, maxCodewordWidth) {
    let rowIndicatorColumn = new DetectionResultRowIndicatorColumn(
      boundingBox,
      leftToRight
    );
    for (let i = 0; i < 2; i++) {
      let increment = i === 0 ? 1 : -1;
      let startColumn = Math.trunc(Math.trunc(startPoint.getX()));
      for (let imageRow = Math.trunc(Math.trunc(startPoint.getY())); imageRow <= boundingBox.getMaxY() && imageRow >= boundingBox.getMinY(); imageRow += increment) {
        let codeword = PDF417ScanningDecoder.detectCodeword(
          image,
          0,
          image.getWidth(),
          leftToRight,
          startColumn,
          imageRow,
          minCodewordWidth,
          maxCodewordWidth
        );
        if (codeword != null) {
          rowIndicatorColumn.setCodeword(imageRow, codeword);
          if (leftToRight) {
            startColumn = codeword.getStartX();
          } else {
            startColumn = codeword.getEndX();
          }
        }
      }
    }
    return rowIndicatorColumn;
  }
  /**
   *
   * @param detectionResult
   * @param BarcodeValue
   * @param param2
   * @param param3
   * @param barcodeMatrix
   *
   * @throws NotFoundException
   */
  static adjustCodewordCount(detectionResult, barcodeMatrix) {
    let barcodeMatrix01 = barcodeMatrix[0][1];
    let numberOfCodewords = barcodeMatrix01.getValue();
    let calculatedNumberOfCodewords = detectionResult.getBarcodeColumnCount() * detectionResult.getBarcodeRowCount() - PDF417ScanningDecoder.getNumberOfECCodeWords(detectionResult.getBarcodeECLevel());
    if (numberOfCodewords.length === 0) {
      if (calculatedNumberOfCodewords < 1 || calculatedNumberOfCodewords > PDF417Common.MAX_CODEWORDS_IN_BARCODE) {
        throw NotFoundException.getNotFoundInstance();
      }
      barcodeMatrix01.setValue(calculatedNumberOfCodewords);
    } else if (numberOfCodewords[0] !== calculatedNumberOfCodewords) {
      barcodeMatrix01.setValue(calculatedNumberOfCodewords);
    }
  }
  /**
   *
   * @param detectionResult
   *
   * @throws FormatException
   * @throws ChecksumException
   * @throws NotFoundException
   */
  static createDecoderResult(detectionResult) {
    let barcodeMatrix = PDF417ScanningDecoder.createBarcodeMatrix(detectionResult);
    PDF417ScanningDecoder.adjustCodewordCount(detectionResult, barcodeMatrix);
    let erasures = new Array();
    let codewords = new Int32Array(detectionResult.getBarcodeRowCount() * detectionResult.getBarcodeColumnCount());
    let ambiguousIndexValuesList = [];
    let ambiguousIndexesList = new Array();
    for (let row = 0; row < detectionResult.getBarcodeRowCount(); row++) {
      for (let column = 0; column < detectionResult.getBarcodeColumnCount(); column++) {
        let values = barcodeMatrix[row][column + 1].getValue();
        let codewordIndex = row * detectionResult.getBarcodeColumnCount() + column;
        if (values.length === 0) {
          erasures.push(codewordIndex);
        } else if (values.length === 1) {
          codewords[codewordIndex] = values[0];
        } else {
          ambiguousIndexesList.push(codewordIndex);
          ambiguousIndexValuesList.push(values);
        }
      }
    }
    let ambiguousIndexValues = new Array(ambiguousIndexValuesList.length);
    for (let i = 0; i < ambiguousIndexValues.length; i++) {
      ambiguousIndexValues[i] = ambiguousIndexValuesList[i];
    }
    return PDF417ScanningDecoder.createDecoderResultFromAmbiguousValues(
      detectionResult.getBarcodeECLevel(),
      codewords,
      PDF417Common.toIntArray(erasures),
      PDF417Common.toIntArray(ambiguousIndexesList),
      ambiguousIndexValues
    );
  }
  /**
   * This method deals with the fact, that the decoding process doesn't always yield a single most likely value. The
   * current error correction implementation doesn't deal with erasures very well, so it's better to provide a value
   * for these ambiguous codewords instead of treating it as an erasure. The problem is that we don't know which of
   * the ambiguous values to choose. We try decode using the first value, and if that fails, we use another of the
   * ambiguous values and try to decode again. This usually only happens on very hard to read and decode barcodes,
   * so decoding the normal barcodes is not affected by this.
   *
   * @param erasureArray contains the indexes of erasures
   * @param ambiguousIndexes array with the indexes that have more than one most likely value
   * @param ambiguousIndexValues two dimensional array that contains the ambiguous values. The first dimension must
   * be the same length as the ambiguousIndexes array
   *
   * @throws FormatException
   * @throws ChecksumException
   */
  static createDecoderResultFromAmbiguousValues(ecLevel, codewords, erasureArray, ambiguousIndexes, ambiguousIndexValues) {
    let ambiguousIndexCount = new Int32Array(ambiguousIndexes.length);
    let tries = 100;
    while (tries-- > 0) {
      for (let i = 0; i < ambiguousIndexCount.length; i++) {
        codewords[ambiguousIndexes[i]] = ambiguousIndexValues[i][ambiguousIndexCount[i]];
      }
      try {
        return PDF417ScanningDecoder.decodeCodewords(codewords, ecLevel, erasureArray);
      } catch (err) {
        let ignored = err instanceof ChecksumException;
        if (!ignored) {
          throw err;
        }
      }
      if (ambiguousIndexCount.length === 0) {
        throw ChecksumException.getChecksumInstance();
      }
      for (let i = 0; i < ambiguousIndexCount.length; i++) {
        if (ambiguousIndexCount[i] < ambiguousIndexValues[i].length - 1) {
          ambiguousIndexCount[i]++;
          break;
        } else {
          ambiguousIndexCount[i] = 0;
          if (i === ambiguousIndexCount.length - 1) {
            throw ChecksumException.getChecksumInstance();
          }
        }
      }
    }
    throw ChecksumException.getChecksumInstance();
  }
  static createBarcodeMatrix(detectionResult) {
    let barcodeMatrix = Array.from({ length: detectionResult.getBarcodeRowCount() }, () => new Array(detectionResult.getBarcodeColumnCount() + 2));
    for (let row = 0; row < barcodeMatrix.length; row++) {
      for (let column2 = 0; column2 < barcodeMatrix[row].length; column2++) {
        barcodeMatrix[row][column2] = new BarcodeValue();
      }
    }
    let column = 0;
    for (let detectionResultColumn of detectionResult.getDetectionResultColumns()) {
      if (detectionResultColumn != null) {
        for (let codeword of detectionResultColumn.getCodewords()) {
          if (codeword != null) {
            let rowNumber = codeword.getRowNumber();
            if (rowNumber >= 0) {
              if (rowNumber >= barcodeMatrix.length) {
                continue;
              }
              barcodeMatrix[rowNumber][column].setValue(codeword.getValue());
            }
          }
        }
      }
      column++;
    }
    return barcodeMatrix;
  }
  static isValidBarcodeColumn(detectionResult, barcodeColumn) {
    return barcodeColumn >= 0 && barcodeColumn <= detectionResult.getBarcodeColumnCount() + 1;
  }
  static getStartColumn(detectionResult, barcodeColumn, imageRow, leftToRight) {
    let offset = leftToRight ? 1 : -1;
    let codeword = null;
    if (PDF417ScanningDecoder.isValidBarcodeColumn(detectionResult, barcodeColumn - offset)) {
      codeword = detectionResult.getDetectionResultColumn(barcodeColumn - offset).getCodeword(imageRow);
    }
    if (codeword != null) {
      return leftToRight ? codeword.getEndX() : codeword.getStartX();
    }
    codeword = detectionResult.getDetectionResultColumn(barcodeColumn).getCodewordNearby(imageRow);
    if (codeword != null) {
      return leftToRight ? codeword.getStartX() : codeword.getEndX();
    }
    if (PDF417ScanningDecoder.isValidBarcodeColumn(detectionResult, barcodeColumn - offset)) {
      codeword = detectionResult.getDetectionResultColumn(barcodeColumn - offset).getCodewordNearby(imageRow);
    }
    if (codeword != null) {
      return leftToRight ? codeword.getEndX() : codeword.getStartX();
    }
    let skippedColumns = 0;
    while (PDF417ScanningDecoder.isValidBarcodeColumn(detectionResult, barcodeColumn - offset)) {
      barcodeColumn -= offset;
      for (let previousRowCodeword of detectionResult.getDetectionResultColumn(barcodeColumn).getCodewords()) {
        if (previousRowCodeword != null) {
          return (leftToRight ? previousRowCodeword.getEndX() : previousRowCodeword.getStartX()) + offset * skippedColumns * (previousRowCodeword.getEndX() - previousRowCodeword.getStartX());
        }
      }
      skippedColumns++;
    }
    return leftToRight ? detectionResult.getBoundingBox().getMinX() : detectionResult.getBoundingBox().getMaxX();
  }
  static detectCodeword(image, minColumn, maxColumn, leftToRight, startColumn, imageRow, minCodewordWidth, maxCodewordWidth) {
    startColumn = PDF417ScanningDecoder.adjustCodewordStartColumn(image, minColumn, maxColumn, leftToRight, startColumn, imageRow);
    let moduleBitCount = PDF417ScanningDecoder.getModuleBitCount(image, minColumn, maxColumn, leftToRight, startColumn, imageRow);
    if (moduleBitCount == null) {
      return null;
    }
    let endColumn;
    let codewordBitCount = MathUtils.sum(moduleBitCount);
    if (leftToRight) {
      endColumn = startColumn + codewordBitCount;
    } else {
      for (let i = 0; i < moduleBitCount.length / 2; i++) {
        let tmpCount = moduleBitCount[i];
        moduleBitCount[i] = moduleBitCount[moduleBitCount.length - 1 - i];
        moduleBitCount[moduleBitCount.length - 1 - i] = tmpCount;
      }
      endColumn = startColumn;
      startColumn = endColumn - codewordBitCount;
    }
    if (!PDF417ScanningDecoder.checkCodewordSkew(codewordBitCount, minCodewordWidth, maxCodewordWidth)) {
      return null;
    }
    let decodedValue = PDF417CodewordDecoder.getDecodedValue(moduleBitCount);
    let codeword = PDF417Common.getCodeword(decodedValue);
    if (codeword === -1) {
      return null;
    }
    return new Codeword(startColumn, endColumn, PDF417ScanningDecoder.getCodewordBucketNumber(decodedValue), codeword);
  }
  static getModuleBitCount(image, minColumn, maxColumn, leftToRight, startColumn, imageRow) {
    let imageColumn = startColumn;
    let moduleBitCount = new Int32Array(8);
    let moduleNumber = 0;
    let increment = leftToRight ? 1 : -1;
    let previousPixelValue = leftToRight;
    while ((leftToRight ? imageColumn < maxColumn : imageColumn >= minColumn) && moduleNumber < moduleBitCount.length) {
      if (image.get(imageColumn, imageRow) === previousPixelValue) {
        moduleBitCount[moduleNumber]++;
        imageColumn += increment;
      } else {
        moduleNumber++;
        previousPixelValue = !previousPixelValue;
      }
    }
    if (moduleNumber === moduleBitCount.length || imageColumn === (leftToRight ? maxColumn : minColumn) && moduleNumber === moduleBitCount.length - 1) {
      return moduleBitCount;
    }
    return null;
  }
  static getNumberOfECCodeWords(barcodeECLevel) {
    return 2 << barcodeECLevel;
  }
  static adjustCodewordStartColumn(image, minColumn, maxColumn, leftToRight, codewordStartColumn, imageRow) {
    let correctedStartColumn = codewordStartColumn;
    let increment = leftToRight ? -1 : 1;
    for (let i = 0; i < 2; i++) {
      while ((leftToRight ? correctedStartColumn >= minColumn : correctedStartColumn < maxColumn) && leftToRight === image.get(correctedStartColumn, imageRow)) {
        if (Math.abs(codewordStartColumn - correctedStartColumn) > PDF417ScanningDecoder.CODEWORD_SKEW_SIZE) {
          return codewordStartColumn;
        }
        correctedStartColumn += increment;
      }
      increment = -increment;
      leftToRight = !leftToRight;
    }
    return correctedStartColumn;
  }
  static checkCodewordSkew(codewordSize, minCodewordWidth, maxCodewordWidth) {
    return minCodewordWidth - PDF417ScanningDecoder.CODEWORD_SKEW_SIZE <= codewordSize && codewordSize <= maxCodewordWidth + PDF417ScanningDecoder.CODEWORD_SKEW_SIZE;
  }
  /**
   * @throws FormatException,
   * @throws ChecksumException
   */
  static decodeCodewords(codewords, ecLevel, erasures) {
    if (codewords.length === 0) {
      throw FormatException.getFormatInstance();
    }
    let numECCodewords = 1 << ecLevel + 1;
    let correctedErrorsCount = PDF417ScanningDecoder.correctErrors(codewords, erasures, numECCodewords);
    PDF417ScanningDecoder.verifyCodewordCount(codewords, numECCodewords);
    let decoderResult = PDF417DecodedBitStreamParser.decode(codewords, "" + ecLevel);
    decoderResult.setErrorsCorrected(correctedErrorsCount);
    decoderResult.setErasures(erasures.length);
    return decoderResult;
  }
  /**
   * <p>Given data and error-correction codewords received, possibly corrupted by errors, attempts to
   * correct the errors in-place.</p>
   *
   * @param codewords   data and error correction codewords
   * @param erasures positions of any known erasures
   * @param numECCodewords number of error correction codewords that are available in codewords
   * @throws ChecksumException if error correction fails
   */
  static correctErrors(codewords, erasures, numECCodewords) {
    if (erasures != null && erasures.length > numECCodewords / 2 + PDF417ScanningDecoder.MAX_ERRORS || numECCodewords < 0 || numECCodewords > PDF417ScanningDecoder.MAX_EC_CODEWORDS) {
      throw ChecksumException.getChecksumInstance();
    }
    return PDF417ScanningDecoder.errorCorrection.decode(codewords, numECCodewords, erasures);
  }
  /**
   * Verify that all is OK with the codeword array.
   * @throws FormatException
   */
  static verifyCodewordCount(codewords, numECCodewords) {
    if (codewords.length < 4) {
      throw FormatException.getFormatInstance();
    }
    let numberOfCodewords = codewords[0];
    if (numberOfCodewords > codewords.length) {
      throw FormatException.getFormatInstance();
    }
    if (numberOfCodewords === 0) {
      if (numECCodewords < codewords.length) {
        codewords[0] = codewords.length - numECCodewords;
      } else {
        throw FormatException.getFormatInstance();
      }
    }
  }
  static getBitCountForCodeword(codeword) {
    let result = new Int32Array(8);
    let previousValue = 0;
    let i = result.length - 1;
    while (true) {
      if ((codeword & 1) !== previousValue) {
        previousValue = codeword & 1;
        i--;
        if (i < 0) {
          break;
        }
      }
      result[i]++;
      codeword >>= 1;
    }
    return result;
  }
  static getCodewordBucketNumber(codeword) {
    if (codeword instanceof Int32Array) {
      return this.getCodewordBucketNumber_Int32Array(codeword);
    }
    return this.getCodewordBucketNumber_number(codeword);
  }
  static getCodewordBucketNumber_number(codeword) {
    return PDF417ScanningDecoder.getCodewordBucketNumber(PDF417ScanningDecoder.getBitCountForCodeword(codeword));
  }
  static getCodewordBucketNumber_Int32Array(moduleBitCount) {
    return (moduleBitCount[0] - moduleBitCount[2] + moduleBitCount[4] - moduleBitCount[6] + 9) % 9;
  }
  static toString(barcodeMatrix) {
    let formatter = new Formatter();
    for (let row = 0; row < barcodeMatrix.length; row++) {
      formatter.format("Row %2d: ", row);
      for (let column = 0; column < barcodeMatrix[row].length; column++) {
        let barcodeValue = barcodeMatrix[row][column];
        if (barcodeValue.getValue().length === 0) {
          formatter.format("        ", null);
        } else {
          formatter.format(
            "%4d(%2d)",
            barcodeValue.getValue()[0],
            barcodeValue.getConfidence(barcodeValue.getValue()[0])
          );
        }
      }
      formatter.format("%n");
    }
    return formatter.toString();
  }
}

export { PDF417ScanningDecoder };
//# sourceMappingURL=PDF417ScanningDecoder.js.map
//# sourceMappingURL=PDF417ScanningDecoder.js.map