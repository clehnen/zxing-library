import { IndexOutOfBoundsException } from './IndexOutOfBoundsException.js';
import './Exception.js';
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
