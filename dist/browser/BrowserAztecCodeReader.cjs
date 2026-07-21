'use strict';

var BrowserCodeReader = require('./BrowserCodeReader');
var AztecCodeReader = require('../core/aztec/AztecCodeReader');

class BrowserAztecCodeReader extends BrowserCodeReader.BrowserCodeReader {
  /**
   * Creates an instance of BrowserAztecCodeReader.
   * @param {number} [timeBetweenScansMillis=500] the time delay between subsequent decode tries
   *
   * @memberOf BrowserAztecCodeReader
   */
  constructor(timeBetweenScansMillis = 500) {
    super(new AztecCodeReader.AztecCodeReader(), timeBetweenScansMillis);
  }
}

exports.BrowserAztecCodeReader = BrowserAztecCodeReader;
//# sourceMappingURL=BrowserAztecCodeReader.cjs.map
//# sourceMappingURL=BrowserAztecCodeReader.cjs.map