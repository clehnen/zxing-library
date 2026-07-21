import { Exception } from './Exception';

class NotFoundException extends Exception {
  static kind = "NotFoundException";
  static getNotFoundInstance() {
    return new NotFoundException();
  }
}

export { NotFoundException };
//# sourceMappingURL=NotFoundException.js.map
//# sourceMappingURL=NotFoundException.js.map