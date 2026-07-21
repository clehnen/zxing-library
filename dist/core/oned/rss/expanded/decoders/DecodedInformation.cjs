'use strict';

var DecodedObject = require('./DecodedObject');

class DecodedInformation extends DecodedObject.DecodedObject {
  newString;
  remainingValue;
  remaining;
  constructor(newPosition, newString, remainingValue) {
    super(newPosition);
    this.newString = newString;
    if (remainingValue === void 0) {
      this.remaining = false;
      this.remainingValue = 0;
    } else {
      this.remaining = true;
      this.remainingValue = remainingValue;
    }
  }
  getNewString() {
    return this.newString;
  }
  isRemaining() {
    return this.remaining;
  }
  getRemainingValue() {
    return this.remainingValue;
  }
}

exports.DecodedInformation = DecodedInformation;
//# sourceMappingURL=DecodedInformation.cjs.map
//# sourceMappingURL=DecodedInformation.cjs.map