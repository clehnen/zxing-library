'use strict';

var BrowserCodeReader = require('./BrowserCodeReader');
var MultiFormatOneDReader = require('../core/oned/MultiFormatOneDReader');

class BrowserBarcodeReader extends BrowserCodeReader.BrowserCodeReader {
  /**
   * Creates an instance of BrowserBarcodeReader.
   * @param {number} [timeBetweenScansMillis=500] the time delay between subsequent decode tries
   * @param {Map<DecodeHintType, any>} hints
   */
  constructor(timeBetweenScansMillis = 500, hints) {
    super(new MultiFormatOneDReader.MultiFormatOneDReader(hints), timeBetweenScansMillis, hints);
  }
}

exports.BrowserBarcodeReader = BrowserBarcodeReader;
//# sourceMappingURL=BrowserBarcodeReader.cjs.map
//# sourceMappingURL=BrowserBarcodeReader.cjs.map