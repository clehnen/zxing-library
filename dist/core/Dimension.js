import { IllegalArgumentException } from './IllegalArgumentException';

class Dimension {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    if (width < 0 || height < 0) {
      throw new IllegalArgumentException();
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

export { Dimension };
//# sourceMappingURL=Dimension.js.map
//# sourceMappingURL=Dimension.js.map