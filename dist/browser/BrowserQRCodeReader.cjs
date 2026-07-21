'use strict';

var BrowserCodeReader = require('./BrowserCodeReader');
var QRCodeReader = require('../core/qrcode/QRCodeReader');

class BrowserQRCodeReader extends BrowserCodeReader.BrowserCodeReader {
  /**
   * Creates an instance of BrowserQRCodeReader.
   * @param {number} [timeBetweenScansMillis=500] the time delay between subsequent decode tries
   */
  constructor(timeBetweenScansMillis = 500) {
    super(new QRCodeReader.QRCodeReader(), timeBetweenScansMillis);
  }
}

exports.BrowserQRCodeReader = BrowserQRCodeReader;
//# sourceMappingURL=BrowserQRCodeReader.cjs.map
//# sourceMappingURL=BrowserQRCodeReader.cjs.map