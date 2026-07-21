'use strict';

var IllegalArgumentException = require('../../../IllegalArgumentException');
var ArithmeticException = require('../../../ArithmeticException');

class ModulusBase {
  logTable;
  expTable;
  modulus;
  add(a, b) {
    return (a + b) % this.modulus;
  }
  subtract(a, b) {
    return (this.modulus + a - b) % this.modulus;
  }
  exp(a) {
    return this.expTable[a];
  }
  log(a) {
    if (a === 0) {
      throw new IllegalArgumentException.IllegalArgumentException();
    }
    return this.logTable[a];
  }
  inverse(a) {
    if (a === 0) {
      throw new ArithmeticException.ArithmeticException();
    }
    return this.expTable[this.modulus - this.logTable[a] - 1];
  }
  multiply(a, b) {
    if (a === 0 || b === 0) {
      return 0;
    }
    return this.expTable[(this.logTable[a] + this.logTable[b]) % (this.modulus - 1)];
  }
  getSize() {
    return this.modulus;
  }
  equals(o) {
    return o === this;
  }
}

exports.ModulusBase = ModulusBase;
//# sourceMappingURL=ModulusBase.cjs.map
//# sourceMappingURL=ModulusBase.cjs.map