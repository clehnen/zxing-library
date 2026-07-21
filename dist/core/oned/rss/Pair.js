import { DataCharacter } from './DataCharacter';

class Pair extends DataCharacter {
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

export { Pair };
//# sourceMappingURL=Pair.js.map
//# sourceMappingURL=Pair.js.map