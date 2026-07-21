import { Exception } from './Exception.js';
import 'ts-custom-error';

/**
 * Custom Error class of type Exception.
 */
declare class FormatException extends Exception {
    static readonly kind: string;
    static getFormatInstance(): FormatException;
}

export { FormatException };
