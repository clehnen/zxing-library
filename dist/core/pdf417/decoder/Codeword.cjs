'use strict';

class Codeword {
  static BARCODE_ROW_UNKNOWN = -1;
  startX;
  endX;
  bucket;
  value;
  rowNumber = Codeword.BARCODE_ROW_UNKNOWN;
  constructor(startX, endX, bucket, value) {
    this.startX = Math.trunc(startX);
    this.endX = Math.trunc(endX);
    this.bucket = Math.trunc(bucket);
    this.value = Math.trunc(value);
  }
  hasValidRowNumber() {
    return this.isValidRowNumber(this.rowNumber);
  }
  isValidRowNumber(rowNumber) {
    return rowNumber !== Codeword.BARCODE_ROW_UNKNOWN && this.bucket === rowNumber % 3 * 3;
  }
  setRowNumberAsRowIndicatorColumn() {
    this.rowNumber = Math.trunc(Math.trunc(this.value / 30) * 3 + Math.trunc(this.bucket / 3));
  }
  getWidth() {
    return this.endX - this.startX;
  }
  getStartX() {
    return this.startX;
  }
  getEndX() {
    return this.endX;
  }
  getBucket() {
    return this.bucket;
  }
  getValue() {
    return this.value;
  }
  getRowNumber() {
    return this.rowNumber;
  }
  setRowNumber(rowNumber) {
    this.rowNumber = rowNumber;
  }
  //   @Override
  toString() {
    return this.rowNumber + "|" + this.value;
  }
}

exports.Codeword = Codeword;
//# sourceMappingURL=Codeword.cjs.map
//# sourceMappingURL=Codeword.cjs.map