'use strict';

var PDF417Common = require('../../PDF417Common');
var ModulusPoly = require('./ModulusPoly');
var IllegalArgumentException = require('../../../IllegalArgumentException');
var ModulusBase = require('./ModulusBase');

class ModulusGF extends ModulusBase.ModulusBase {
  static PDF417_GF = new ModulusGF(PDF417Common.PDF417Common.NUMBER_OF_CODEWORDS, 3);
  // private /*final*/ expTable: Int32Array;
  // private /*final*/ logTable: Int32Array;
  zero;
  one;
  // private /*final*/ modulus: /*int*/ number;
  constructor(modulus, generator) {
    super();
    this.modulus = modulus;
    this.expTable = new Int32Array(modulus);
    this.logTable = new Int32Array(modulus);
    let x = 1;
    for (let i = 0; i < modulus; i++) {
      this.expTable[i] = x;
      x = x * generator % modulus;
    }
    for (let i = 0; i < modulus - 1; i++) {
      this.logTable[this.expTable[i]] = i;
    }
    this.zero = new ModulusPoly.ModulusPoly(this, new Int32Array([0]));
    this.one = new ModulusPoly.ModulusPoly(this, new Int32Array([1]));
  }
  getZero() {
    return this.zero;
  }
  getOne() {
    return this.one;
  }
  buildMonomial(degree, coefficient) {
    if (degree < 0) {
      throw new IllegalArgumentException.IllegalArgumentException();
    }
    if (coefficient === 0) {
      return this.zero;
    }
    let coefficients = new Int32Array(degree + 1);
    coefficients[0] = coefficient;
    return new ModulusPoly.ModulusPoly(this, coefficients);
  }
}

exports.ModulusGF = ModulusGF;
//# sourceMappingURL=ModulusGF.cjs.map
//# sourceMappingURL=ModulusGF.cjs.map