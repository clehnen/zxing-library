'use strict';

var PDF417Common = require('../PDF417Common');
var BarcodeMetadata = require('./BarcodeMetadata');
var DetectionResultColumn = require('./DetectionResultColumn');
var BarcodeValue = require('./BarcodeValue');

class DetectionResultRowIndicatorColumn extends DetectionResultColumn.DetectionResultColumn {
  _isLeft;
  constructor(boundingBox, isLeft) {
    super(boundingBox);
    this._isLeft = isLeft;
  }
  setRowNumbers() {
    for (let codeword of this.getCodewords()) {
      if (codeword != null) {
        codeword.setRowNumberAsRowIndicatorColumn();
      }
    }
  }
  // TODO implement properly
  // TODO maybe we should add missing codewords to store the correct row number to make
  // finding row numbers for other columns easier
  // use row height count to make detection of invalid row numbers more reliable
  adjustCompleteIndicatorColumnRowNumbers(barcodeMetadata) {
    let codewords = this.getCodewords();
    this.setRowNumbers();
    this.removeIncorrectCodewords(codewords, barcodeMetadata);
    let boundingBox = this.getBoundingBox();
    let top = this._isLeft ? boundingBox.getTopLeft() : boundingBox.getTopRight();
    let bottom = this._isLeft ? boundingBox.getBottomLeft() : boundingBox.getBottomRight();
    let firstRow = this.imageRowToCodewordIndex(Math.trunc(top.getY()));
    let lastRow = this.imageRowToCodewordIndex(Math.trunc(bottom.getY()));
    let barcodeRow = -1;
    let maxRowHeight = 1;
    let currentRowHeight = 0;
    for (let codewordsRow = firstRow; codewordsRow < lastRow; codewordsRow++) {
      if (codewords[codewordsRow] == null) {
        continue;
      }
      let codeword = codewords[codewordsRow];
      let rowDifference = codeword.getRowNumber() - barcodeRow;
      if (rowDifference === 0) {
        currentRowHeight++;
      } else if (rowDifference === 1) {
        maxRowHeight = Math.max(maxRowHeight, currentRowHeight);
        currentRowHeight = 1;
        barcodeRow = codeword.getRowNumber();
      } else if (rowDifference < 0 || codeword.getRowNumber() >= barcodeMetadata.getRowCount() || rowDifference > codewordsRow) {
        codewords[codewordsRow] = null;
      } else {
        let checkedRows;
        if (maxRowHeight > 2) {
          checkedRows = (maxRowHeight - 2) * rowDifference;
        } else {
          checkedRows = rowDifference;
        }
        let closePreviousCodewordFound = checkedRows >= codewordsRow;
        for (let i = 1; i <= checkedRows && !closePreviousCodewordFound; i++) {
          closePreviousCodewordFound = codewords[codewordsRow - i] != null;
        }
        if (closePreviousCodewordFound) {
          codewords[codewordsRow] = null;
        } else {
          barcodeRow = codeword.getRowNumber();
          currentRowHeight = 1;
        }
      }
    }
  }
  getRowHeights() {
    let barcodeMetadata = this.getBarcodeMetadata();
    if (barcodeMetadata == null) {
      return null;
    }
    this.adjustIncompleteIndicatorColumnRowNumbers(barcodeMetadata);
    let result = new Int32Array(barcodeMetadata.getRowCount());
    for (let codeword of this.getCodewords()) {
      if (codeword != null) {
        let rowNumber = codeword.getRowNumber();
        if (rowNumber >= result.length) {
          continue;
        }
        result[rowNumber]++;
      }
    }
    return result;
  }
  // TODO maybe we should add missing codewords to store the correct row number to make
  // finding row numbers for other columns easier
  // use row height count to make detection of invalid row numbers more reliable
  adjustIncompleteIndicatorColumnRowNumbers(barcodeMetadata) {
    let boundingBox = this.getBoundingBox();
    let top = this._isLeft ? boundingBox.getTopLeft() : boundingBox.getTopRight();
    let bottom = this._isLeft ? boundingBox.getBottomLeft() : boundingBox.getBottomRight();
    let firstRow = this.imageRowToCodewordIndex(Math.trunc(top.getY()));
    let lastRow = this.imageRowToCodewordIndex(Math.trunc(bottom.getY()));
    let codewords = this.getCodewords();
    let barcodeRow = -1;
    for (let codewordsRow = firstRow; codewordsRow < lastRow; codewordsRow++) {
      if (codewords[codewordsRow] == null) {
        continue;
      }
      let codeword = codewords[codewordsRow];
      codeword.setRowNumberAsRowIndicatorColumn();
      let rowDifference = codeword.getRowNumber() - barcodeRow;
      if (rowDifference === 0) ; else if (rowDifference === 1) {
        barcodeRow = codeword.getRowNumber();
      } else if (codeword.getRowNumber() >= barcodeMetadata.getRowCount()) {
        codewords[codewordsRow] = null;
      } else {
        barcodeRow = codeword.getRowNumber();
      }
    }
  }
  getBarcodeMetadata() {
    let codewords = this.getCodewords();
    let barcodeColumnCount = new BarcodeValue.BarcodeValue();
    let barcodeRowCountUpperPart = new BarcodeValue.BarcodeValue();
    let barcodeRowCountLowerPart = new BarcodeValue.BarcodeValue();
    let barcodeECLevel = new BarcodeValue.BarcodeValue();
    for (let codeword of codewords) {
      if (codeword == null) {
        continue;
      }
      codeword.setRowNumberAsRowIndicatorColumn();
      let rowIndicatorValue = codeword.getValue() % 30;
      let codewordRowNumber = codeword.getRowNumber();
      if (!this._isLeft) {
        codewordRowNumber += 2;
      }
      switch (codewordRowNumber % 3) {
        case 0:
          barcodeRowCountUpperPart.setValue(rowIndicatorValue * 3 + 1);
          break;
        case 1:
          barcodeECLevel.setValue(rowIndicatorValue / 3);
          barcodeRowCountLowerPart.setValue(rowIndicatorValue % 3);
          break;
        case 2:
          barcodeColumnCount.setValue(rowIndicatorValue + 1);
          break;
      }
    }
    if (barcodeColumnCount.getValue().length === 0 || barcodeRowCountUpperPart.getValue().length === 0 || barcodeRowCountLowerPart.getValue().length === 0 || barcodeECLevel.getValue().length === 0 || barcodeColumnCount.getValue()[0] < 1 || barcodeRowCountUpperPart.getValue()[0] + barcodeRowCountLowerPart.getValue()[0] < PDF417Common.PDF417Common.MIN_ROWS_IN_BARCODE || barcodeRowCountUpperPart.getValue()[0] + barcodeRowCountLowerPart.getValue()[0] > PDF417Common.PDF417Common.MAX_ROWS_IN_BARCODE) {
      return null;
    }
    let barcodeMetadata = new BarcodeMetadata.BarcodeMetadata(
      barcodeColumnCount.getValue()[0],
      barcodeRowCountUpperPart.getValue()[0],
      barcodeRowCountLowerPart.getValue()[0],
      barcodeECLevel.getValue()[0]
    );
    this.removeIncorrectCodewords(codewords, barcodeMetadata);
    return barcodeMetadata;
  }
  removeIncorrectCodewords(codewords, barcodeMetadata) {
    for (let codewordRow = 0; codewordRow < codewords.length; codewordRow++) {
      let codeword = codewords[codewordRow];
      if (codewords[codewordRow] == null) {
        continue;
      }
      let rowIndicatorValue = codeword.getValue() % 30;
      let codewordRowNumber = codeword.getRowNumber();
      if (codewordRowNumber > barcodeMetadata.getRowCount()) {
        codewords[codewordRow] = null;
        continue;
      }
      if (!this._isLeft) {
        codewordRowNumber += 2;
      }
      switch (codewordRowNumber % 3) {
        case 0:
          if (rowIndicatorValue * 3 + 1 !== barcodeMetadata.getRowCountUpperPart()) {
            codewords[codewordRow] = null;
          }
          break;
        case 1:
          if (Math.trunc(rowIndicatorValue / 3) !== barcodeMetadata.getErrorCorrectionLevel() || rowIndicatorValue % 3 !== barcodeMetadata.getRowCountLowerPart()) {
            codewords[codewordRow] = null;
          }
          break;
        case 2:
          if (rowIndicatorValue + 1 !== barcodeMetadata.getColumnCount()) {
            codewords[codewordRow] = null;
          }
          break;
      }
    }
  }
  isLeft() {
    return this._isLeft;
  }
  // @Override
  toString() {
    return "IsLeft: " + this._isLeft + "\n" + super.toString();
  }
}

exports.DetectionResultRowIndicatorColumn = DetectionResultRowIndicatorColumn;
//# sourceMappingURL=DetectionResultRowIndicatorColumn.cjs.map
//# sourceMappingURL=DetectionResultRowIndicatorColumn.cjs.map