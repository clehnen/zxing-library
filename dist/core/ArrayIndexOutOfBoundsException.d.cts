import { IndexOutOfBoundsException } from './IndexOutOfBoundsException.cjs';
import './Exception.cjs';
import 'ts-custom-error';

/**
 * Custom Error class of type Exception.
 */
declare class ArrayIndexOutOfBoundsException extends IndexOutOfBoundsException {
    index: number;
    message: string;
    static readonly kind: string;
    constructor(index?: number, message?: string);
}

export { ArrayIndexOutOfBoundsException };
