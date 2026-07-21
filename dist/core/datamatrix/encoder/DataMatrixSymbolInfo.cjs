'use strict';

var constants = require('./constants');

class DataMatrixSymbolInfo {
  constructor(rectangular, dataCapacity, errorCodewords, matrixWidth, matrixHeight, dataRegions, rsBlockData = 0, rsBlockError = 0) {
    this.rectangular = rectangular;
    this.dataCapacity = dataCapacity;
    this.errorCodewords = errorCodewords;
    this.matrixWidth = matrixWidth;
    this.matrixHeight = matrixHeight;
    this.dataRegions = dataRegions;
    this.rsBlockData = rsBlockData;
    this.rsBlockError = rsBlockError;
  }
  rectangular;
  dataCapacity;
  errorCodewords;
  matrixWidth;
  matrixHeight;
  dataRegions;
  rsBlockData;
  rsBlockError;
  static lookup(dataCodewords, shape = constants.SymbolShapeHint.FORCE_NONE, minSize = null, maxSize = null, fail = true) {
    for (const symbol of PROD_SYMBOLS) {
      if (shape === constants.SymbolShapeHint.FORCE_SQUARE && symbol.rectangular) {
        continue;
      }
      if (shape === constants.SymbolShapeHint.FORCE_RECTANGLE && !symbol.rectangular) {
        continue;
      }
      if (minSize != null && (symbol.getSymbolWidth() < minSize.getWidth() || symbol.getSymbolHeight() < minSize.getHeight())) {
        continue;
      }
      if (maxSize != null && (symbol.getSymbolWidth() > maxSize.getWidth() || symbol.getSymbolHeight() > maxSize.getHeight())) {
        continue;
      }
      if (dataCodewords <= symbol.dataCapacity) {
        return symbol;
      }
    }
    if (fail) {
      throw new Error(
        "Can't find a symbol arrangement that matches the message. Data codewords: " + dataCodewords
      );
    }
    return null;
  }
  getHorizontalDataRegions() {
    switch (this.dataRegions) {
      case 1:
        return 1;
      case 2:
      case 4:
        return 2;
      case 16:
        return 4;
      case 36:
        return 6;
      default:
        throw new Error("Cannot handle this number of data regions");
    }
  }
  getVerticalDataRegions() {
    switch (this.dataRegions) {
      case 1:
      case 2:
        return 1;
      case 4:
        return 2;
      case 16:
        return 4;
      case 36:
        return 6;
      default:
        throw new Error("Cannot handle this number of data regions");
    }
  }
  getSymbolDataWidth() {
    return this.getHorizontalDataRegions() * this.matrixWidth;
  }
  getSymbolDataHeight() {
    return this.getVerticalDataRegions() * this.matrixHeight;
  }
  getSymbolWidth() {
    return this.getSymbolDataWidth() + this.getHorizontalDataRegions() * 2;
  }
  getSymbolHeight() {
    return this.getSymbolDataHeight() + this.getVerticalDataRegions() * 2;
  }
  getCodewordCount() {
    return this.dataCapacity + this.errorCodewords;
  }
  getInterleavedBlockCount() {
    if (!this.rsBlockData) return 1;
    return this.dataCapacity / this.rsBlockData;
  }
  getDataCapacity() {
    return this.dataCapacity;
  }
  getErrorCodewords() {
    return this.errorCodewords;
  }
  getDataLengthForInterleavedBlock(index) {
    return this.rsBlockData;
  }
  getErrorLengthForInterleavedBlock(index) {
    return this.rsBlockError;
  }
}
class DataMatrixSymbolInfo144 extends DataMatrixSymbolInfo {
  constructor() {
    super(false, 1558, 620, 22, 22, 36, -1, 62);
  }
  getInterleavedBlockCount() {
    return 10;
  }
  getDataLengthForInterleavedBlock(index) {
    return index <= 8 ? 156 : 155;
  }
}
const PROD_SYMBOLS = [
  new DataMatrixSymbolInfo(false, 3, 5, 8, 8, 1),
  new DataMatrixSymbolInfo(false, 5, 7, 10, 10, 1),
  /*rect*/
  new DataMatrixSymbolInfo(true, 5, 7, 16, 6, 1),
  new DataMatrixSymbolInfo(false, 8, 10, 12, 12, 1),
  /*rect*/
  new DataMatrixSymbolInfo(true, 10, 11, 14, 6, 2),
  new DataMatrixSymbolInfo(false, 12, 12, 14, 14, 1),
  /*rect*/
  new DataMatrixSymbolInfo(true, 16, 14, 24, 10, 1),
  new DataMatrixSymbolInfo(false, 18, 14, 16, 16, 1),
  new DataMatrixSymbolInfo(false, 22, 18, 18, 18, 1),
  /*rect*/
  new DataMatrixSymbolInfo(true, 22, 18, 16, 10, 2),
  new DataMatrixSymbolInfo(false, 30, 20, 20, 20, 1),
  /*rect*/
  new DataMatrixSymbolInfo(true, 32, 24, 16, 14, 2),
  new DataMatrixSymbolInfo(false, 36, 24, 22, 22, 1),
  new DataMatrixSymbolInfo(false, 44, 28, 24, 24, 1),
  /*rect*/
  new DataMatrixSymbolInfo(true, 49, 28, 22, 14, 2),
  new DataMatrixSymbolInfo(false, 62, 36, 14, 14, 4),
  new DataMatrixSymbolInfo(false, 86, 42, 16, 16, 4),
  new DataMatrixSymbolInfo(false, 114, 48, 18, 18, 4),
  new DataMatrixSymbolInfo(false, 144, 56, 20, 20, 4),
  new DataMatrixSymbolInfo(false, 174, 68, 22, 22, 4),
  new DataMatrixSymbolInfo(false, 204, 84, 24, 24, 4, 102, 42),
  new DataMatrixSymbolInfo(false, 280, 112, 14, 14, 16, 140, 56),
  new DataMatrixSymbolInfo(false, 368, 144, 16, 16, 16, 92, 36),
  new DataMatrixSymbolInfo(false, 456, 192, 18, 18, 16, 114, 48),
  new DataMatrixSymbolInfo(false, 576, 224, 20, 20, 16, 144, 56),
  new DataMatrixSymbolInfo(false, 696, 272, 22, 22, 16, 174, 68),
  new DataMatrixSymbolInfo(false, 816, 336, 24, 24, 16, 136, 56),
  new DataMatrixSymbolInfo(false, 1050, 408, 18, 18, 36, 175, 68),
  new DataMatrixSymbolInfo(false, 1304, 496, 20, 20, 36, 163, 62),
  new DataMatrixSymbolInfo144()
];

exports.DataMatrixSymbolInfo = DataMatrixSymbolInfo;
exports.PROD_SYMBOLS = PROD_SYMBOLS;
//# sourceMappingURL=DataMatrixSymbolInfo.cjs.map
//# sourceMappingURL=DataMatrixSymbolInfo.cjs.map