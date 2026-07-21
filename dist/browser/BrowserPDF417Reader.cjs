'use strict';

var BrowserCodeReader = require('./BrowserCodeReader');
var PDF417Reader = require('../core/pdf417/PDF417Reader');

class BrowserPDF417Reader extends BrowserCodeReader.BrowserCodeReader {
  /**
   * Creates an instance of BrowserPDF417Reader.
   * @param {number} [timeBetweenScansMillis=500] the time delay between subsequent decode tries
   */
  constructor(timeBetweenScansMillis = 500) {
    super(new PDF417Reader.PDF417Reader(), timeBetweenScansMillis);
  }
}

exports.BrowserPDF417Reader = BrowserPDF417Reader;
//# sourceMappingURL=BrowserPDF417Reader.cjs.map
//# sourceMappingURL=BrowserPDF417Reader.cjs.map