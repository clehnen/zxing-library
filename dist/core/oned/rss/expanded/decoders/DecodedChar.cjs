'use strict';

var DecodedObject = require('./DecodedObject');

class DecodedChar extends DecodedObject.DecodedObject {
  value;
  static FNC1 = "$";
  // It's not in Alphanumeric neither in ISO/IEC 646 charset
  constructor(newPosition, value) {
    super(newPosition);
    this.value = value;
  }
  getValue() {
    return this.value;
  }
  isFNC1() {
    return this.value === DecodedChar.FNC1;
  }
}

exports.DecodedChar = DecodedChar;
//# sourceMappingURL=DecodedChar.cjs.map
//# sourceMappingURL=DecodedChar.cjs.map