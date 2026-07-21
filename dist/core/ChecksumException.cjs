'use strict';

var Exception = require('./Exception');

class ChecksumException extends Exception.Exception {
  static kind = "ChecksumException";
  static getChecksumInstance() {
    return new ChecksumException();
  }
}

exports.ChecksumException = ChecksumException;
//# sourceMappingURL=ChecksumException.cjs.map
//# sourceMappingURL=ChecksumException.cjs.map