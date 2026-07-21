'use strict';

var IndexOutOfBoundsException = require('./IndexOutOfBoundsException');

class ArrayIndexOutOfBoundsException extends IndexOutOfBoundsException.IndexOutOfBoundsException {
  constructor(index = void 0, message = void 0) {
    super(message);
    this.index = index;
    this.message = message;
  }
  index;
  message;
  static kind = "ArrayIndexOutOfBoundsException";
}

exports.ArrayIndexOutOfBoundsException = ArrayIndexOutOfBoundsException;
//# sourceMappingURL=ArrayIndexOutOfBoundsException.cjs.map
//# sourceMappingURL=ArrayIndexOutOfBoundsException.cjs.map