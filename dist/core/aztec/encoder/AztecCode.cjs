'use strict';

class AztecCode {
  compact;
  size;
  layers;
  codeWords;
  matrix;
  /**
   * @return {@code true} if compact instead of full mode
   */
  isCompact() {
    return this.compact;
  }
  setCompact(compact) {
    this.compact = compact;
  }
  /**
   * @return size in pixels (width and height)
   */
  getSize() {
    return this.size;
  }
  setSize(size) {
    this.size = size;
  }
  /**
   * @return number of levels
   */
  getLayers() {
    return this.layers;
  }
  setLayers(layers) {
    this.layers = layers;
  }
  /**
   * @return number of data codewords
   */
  getCodeWords() {
    return this.codeWords;
  }
  setCodeWords(codeWords) {
    this.codeWords = codeWords;
  }
  /**
   * @return the symbol image
   */
  getMatrix() {
    return this.matrix;
  }
  setMatrix(matrix) {
    this.matrix = matrix;
  }
}

exports.AztecCode = AztecCode;
//# sourceMappingURL=AztecCode.cjs.map
//# sourceMappingURL=AztecCode.cjs.map