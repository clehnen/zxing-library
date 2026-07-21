import { Exception } from './Exception';

/**
 * Custom Error class of type Exception.
 */
export class ArgumentException extends Exception {
  static readonly kind: string = 'ArgumentException';
}
