'use strict';

var BrowserCodeReader = require('./BrowserCodeReader');
var DataMatrixReader = require('../core/datamatrix/DataMatrixReader');

class BrowserDatamatrixCodeReader extends BrowserCodeReader.BrowserCodeReader {
  /**
   * Creates an instance of BrowserQRCodeReader.
   * @param {number} [timeBetweenScansMillis=500] the time delay between subsequent decode tries
   */
  constructor(timeBetweenScansMillis = 500) {
    super(new DataMatrixReader.DataMatrixReader(), timeBetweenScansMillis);
  }
}

exports.BrowserDatamatrixCodeReader = BrowserDatamatrixCodeReader;
//# sourceMappingURL=BrowserDatamatrixCodeReader.cjs.map
//# sourceMappingURL=BrowserDatamatrixCodeReader.cjs.map