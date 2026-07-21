import { Exception } from './Exception';

/**
 * Custom Error class of type Exception.
 */
export class WriterException extends Exception {
  static readonly kind: string = 'WriterException';
}
