'use strict';

var IllegalArgumentException = require('../../IllegalArgumentException');

class AbstractGenericGF {
  expTable;
  logTable;
  /**
   * @return 2 to the power of a in GF(size)
   */
  exp(a) {
    return this.expTable[a];
  }
  /**
   * @return base 2 log of a in GF(size)
   */
  log(a) {
    if (a === 0) {
      throw new IllegalArgumentException.IllegalArgumentException();
    }
    return this.logTable[a];
  }
  /**
   * Implements both addition and subtraction -- they are the same in GF(size).
   *
   * @return sum/difference of a and b
   */
  static addOrSubtract(a, b) {
    return a ^ b;
  }
}

exports.AbstractGenericGF = AbstractGenericGF;
//# sourceMappingURL=AbstractGenericGF.cjs.map
//# sourceMappingURL=AbstractGenericGF.cjs.map