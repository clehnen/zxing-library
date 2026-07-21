import { CustomError } from 'ts-custom-error';

class Exception extends CustomError {
  /**
   * Allows Exception to be constructed directly
   * with some message and prototype definition.
   */
  constructor(message = void 0) {
    super(message);
    this.message = message;
  }
  message;
  /**
   * It's typed as string so it can be extended and overriden.
   */
  static kind = "Exception";
  getKind() {
    const ex = this.constructor;
    return ex.kind;
  }
}

export { Exception };
//# sourceMappingURL=Exception.js.map
//# sourceMappingURL=Exception.js.map