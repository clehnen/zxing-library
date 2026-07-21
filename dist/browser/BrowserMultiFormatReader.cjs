'use strict';

var BrowserCodeReader = require('./BrowserCodeReader');
var MultiFormatReader = require('../core/MultiFormatReader');

class BrowserMultiFormatReader extends BrowserCodeReader.BrowserCodeReader {
  set hints(hints) {
    this._hints = hints || null;
    this.reader.setHints(hints);
  }
  constructor(hints = null, timeBetweenScansMillis = 500) {
    const reader = new MultiFormatReader.MultiFormatReader();
    reader.setHints(hints);
    super(reader, timeBetweenScansMillis);
  }
  /**
   * Overwrite decodeBitmap to call decodeWithState, which will pay
   * attention to the hints set in the constructor function
   */
  decodeBitmap(binaryBitmap) {
    try {
      return this.reader.decodeWithState(binaryBitmap);
    } finally {
      this.reader.reset();
    }
  }
}

exports.BrowserMultiFormatReader = BrowserMultiFormatReader;
//# sourceMappingURL=BrowserMultiFormatReader.cjs.map
//# sourceMappingURL=BrowserMultiFormatReader.cjs.map