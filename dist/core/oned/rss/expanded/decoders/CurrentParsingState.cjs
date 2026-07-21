'use strict';

class CurrentParsingState {
  position;
  encoding;
  constructor() {
    this.position = 0;
    this.encoding = 0 /* NUMERIC */;
  }
  getPosition() {
    return this.position;
  }
  setPosition(position) {
    this.position = position;
  }
  incrementPosition(delta) {
    this.position += delta;
  }
  isAlpha() {
    return this.encoding === 1 /* ALPHA */;
  }
  isNumeric() {
    return this.encoding === 0 /* NUMERIC */;
  }
  isIsoIec646() {
    return this.encoding === 2 /* ISO_IEC_646 */;
  }
  setNumeric() {
    this.encoding = 0 /* NUMERIC */;
  }
  setAlpha() {
    this.encoding = 1 /* ALPHA */;
  }
  setIsoIec646() {
    this.encoding = 2 /* ISO_IEC_646 */;
  }
}

exports.CurrentParsingState = CurrentParsingState;
//# sourceMappingURL=CurrentParsingState.cjs.map
//# sourceMappingURL=CurrentParsingState.cjs.map