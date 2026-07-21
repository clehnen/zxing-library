'use strict';

var Exception = require('./Exception');

class NotFoundException extends Exception.Exception {
  static kind = "NotFoundException";
  static getNotFoundInstance() {
    return new NotFoundException();
  }
}

exports.NotFoundException = NotFoundException;
//# sourceMappingURL=NotFoundException.cjs.map
//# sourceMappingURL=NotFoundException.cjs.map