import { PDF417Common } from '../../PDF417Common';
import { ModulusPoly } from './ModulusPoly';
import { IllegalArgumentException } from '../../../IllegalArgumentException';
import { ModulusBase } from './ModulusBase';

class ModulusGF extends ModulusBase {
  static PDF417_GF = new ModulusGF(PDF417Common.NUMBER_OF_CODEWORDS, 3);
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
    this.zero = new ModulusPoly(this, new Int32Array([0]));
    this.one = new ModulusPoly(this, new Int32Array([1]));
  }
  getZero() {
    return this.zero;
  }
  getOne() {
    return this.one;
  }
  buildMonomial(degree, coefficient) {
    if (degree < 0) {
      throw new IllegalArgumentException();
    }
    if (coefficient === 0) {
      return this.zero;
    }
    let coefficients = new Int32Array(degree + 1);
    coefficients[0] = coefficient;
    return new ModulusPoly(this, coefficients);
  }
}

export { ModulusGF };
//# sourceMappingURL=ModulusGF.js.map
//# sourceMappingURL=ModulusGF.js.map