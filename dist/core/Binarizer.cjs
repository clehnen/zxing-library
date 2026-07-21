'use strict';

class Binarizer {
  constructor(source) {
    this.source = source;
  }
  source;
  getLuminanceSource() {
    return this.source;
  }
  getWidth() {
    return this.source.getWidth();
  }
  getHeight() {
    return this.source.getHeight();
  }
}

exports.Binarizer = Binarizer;
//# sourceMappingURL=Binarizer.cjs.map
//# sourceMappingURL=Binarizer.cjs.map