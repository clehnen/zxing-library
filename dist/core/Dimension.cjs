'use strict';

var IllegalArgumentException = require('./IllegalArgumentException');

class Dimension {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    if (width < 0 || height < 0) {
      throw new IllegalArgumentException.IllegalArgumentException();
    }
  }
  width;
  height;
  getWidth() {
    return this.width;
  }
  getHeight() {
    return this.height;
  }
  /*@Override*/
  equals(other) {
    if (other instanceof Dimension) {
      const d = other;
      return this.width === d.width && this.height === d.height;
    }
    return false;
  }
  /*@Override*/
  hashCode() {
    return this.width * 32713 + this.height;
  }
  /*@Override*/
  toString() {
    return this.width + "x" + this.height;
  }
}

exports.Dimension = Dimension;
//# sourceMappingURL=Dimension.cjs.map
//# sourceMappingURL=Dimension.cjs.map