import { IndexOutOfBoundsException } from './IndexOutOfBoundsException';

/**
 * Custom Error class of type Exception.
 */
export class ArrayIndexOutOfBoundsException extends IndexOutOfBoundsException {
  static readonly kind: string = 'ArrayIndexOutOfBoundsException';
  constructor(
    public index: number = undefined,
    public message: string = undefined
  ) {
    super(message);
  }
}
