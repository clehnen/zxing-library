'use strict';

class BarcodeMetadata {
  columnCount;
  errorCorrectionLevel;
  rowCountUpperPart;
  rowCountLowerPart;
  rowCount;
  constructor(columnCount, rowCountUpperPart, rowCountLowerPart, errorCorrectionLevel) {
    this.columnCount = columnCount;
    this.errorCorrectionLevel = errorCorrectionLevel;
    this.rowCountUpperPart = rowCountUpperPart;
    this.rowCountLowerPart = rowCountLowerPart;
    this.rowCount = rowCountUpperPart + rowCountLowerPart;
  }
  getColumnCount() {
    return this.columnCount;
  }
  getErrorCorrectionLevel() {
    return this.errorCorrectionLevel;
  }
  getRowCount() {
    return this.rowCount;
  }
  getRowCountUpperPart() {
    return this.rowCountUpperPart;
  }
  getRowCountLowerPart() {
    return this.rowCountLowerPart;
  }
}

exports.BarcodeMetadata = BarcodeMetadata;
//# sourceMappingURL=BarcodeMetadata.cjs.map
//# sourceMappingURL=BarcodeMetadata.cjs.map