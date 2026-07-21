import { Exception } from './Exception';

/**
 * Custom Error class of type Exception.
 */
export class IndexOutOfBoundsException extends Exception {
  static readonly kind: string = 'IndexOutOfBoundsException';
}
