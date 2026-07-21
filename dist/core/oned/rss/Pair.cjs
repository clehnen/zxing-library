'use strict';

var DataCharacter = require('./DataCharacter');

class Pair extends DataCharacter.DataCharacter {
  finderPattern;
  count = 0;
  constructor(value, checksumPortion, finderPattern) {
    super(value, checksumPortion);
    this.finderPattern = finderPattern;
  }
  getFinderPattern() {
    return this.finderPattern;
  }
  getCount() {
    return this.count;
  }
  incrementCount() {
    this.count++;
  }
}

exports.Pair = Pair;
//# sourceMappingURL=Pair.cjs.map
//# sourceMappingURL=Pair.cjs.map