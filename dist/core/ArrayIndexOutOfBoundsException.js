import { IndexOutOfBoundsException } from './IndexOutOfBoundsException';

class ArrayIndexOutOfBoundsException extends IndexOutOfBoundsException {
  constructor(index = void 0, message = void 0) {
    super(message);
    this.index = index;
    this.message = message;
  }
  index;
  message;
  static kind = "ArrayIndexOutOfBoundsException";
}

export { ArrayIndexOutOfBoundsException };
//# sourceMappingURL=ArrayIndexOutOfBoundsException.js.map
//# sourceMappingURL=ArrayIndexOutOfBoundsException.js.map