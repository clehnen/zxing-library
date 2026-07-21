import { Exception } from './Exception';

/**
 * Custom Error class of type Exception.
 */
export class ReedSolomonException extends Exception {
  static readonly kind: string = 'ReedSolomonException';
}
