import { Exception } from './Exception';

/**
 * Custom Error class of type Exception.
 */
export class NotFoundException extends Exception {
  static readonly kind: string = 'NotFoundException';
  static getNotFoundInstance(): NotFoundException {
    return new NotFoundException();
  }
}
