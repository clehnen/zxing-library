import { Exception } from './Exception';

/**
 * Custom Error class of type Exception.
 */
export class ChecksumException extends Exception {
  static readonly kind: string = 'ChecksumException';
  static getChecksumInstance(): ChecksumException {
    return new ChecksumException();
  }
}
