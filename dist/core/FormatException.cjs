'use strict';

var Exception = require('./Exception');

class FormatException extends Exception.Exception {
  static kind = "FormatException";
  static getFormatInstance() {
    return new FormatException();
  }
}

exports.FormatException = FormatException;
//# sourceMappingURL=FormatException.cjs.map
//# sourceMappingURL=FormatException.cjs.map