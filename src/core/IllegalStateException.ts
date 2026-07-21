import { Exception } from './Exception';

/**
 * Custom Error class of type Exception.
 */
export class IllegalStateException extends Exception {
  static readonly kind: string = 'IllegalStateException';
}
