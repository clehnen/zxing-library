import { Exception } from './Exception';

class FormatException extends Exception {
  static kind = "FormatException";
  static getFormatInstance() {
    return new FormatException();
  }
}

export { FormatException };
//# sourceMappingURL=FormatException.js.map
//# sourceMappingURL=FormatException.js.map