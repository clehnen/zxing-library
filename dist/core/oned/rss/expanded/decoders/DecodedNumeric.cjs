'use strict';

var FormatException = require('../../../../FormatException');
var DecodedObject = require('./DecodedObject');

class DecodedNumeric extends DecodedObject.DecodedObject {
  firstDigit;
  secondDigit;
  static FNC1 = 10;
  constructor(newPosition, firstDigit, secondDigit) {
    super(newPosition);
    if (firstDigit < 0 || firstDigit > 10 || secondDigit < 0 || secondDigit > 10) {
      throw new FormatException.FormatException();
    }
    this.firstDigit = firstDigit;
    this.secondDigit = secondDigit;
  }
  getFirstDigit() {
    return this.firstDigit;
  }
  getSecondDigit() {
    return this.secondDigit;
  }
  getValue() {
    return this.firstDigit * 10 + this.secondDigit;
  }
  isFirstDigitFNC1() {
    return this.firstDigit === DecodedNumeric.FNC1;
  }
  isSecondDigitFNC1() {
    return this.secondDigit === DecodedNumeric.FNC1;
  }
}

exports.DecodedNumeric = DecodedNumeric;
//# sourceMappingURL=DecodedNumeric.cjs.map
//# sourceMappingURL=DecodedNumeric.cjs.map