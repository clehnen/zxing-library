import { Exception } from './Exception';

/**
 * Custom Error class of type Exception.
 */
export class IllegalArgumentException extends Exception {
  static readonly kind: string = 'IllegalArgumentException';
}
