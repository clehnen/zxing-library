import { Exception } from './Exception';

class ChecksumException extends Exception {
  static kind = "ChecksumException";
  static getChecksumInstance() {
    return new ChecksumException();
  }
}

export { ChecksumException };
//# sourceMappingURL=ChecksumException.js.map
//# sourceMappingURL=ChecksumException.js.map