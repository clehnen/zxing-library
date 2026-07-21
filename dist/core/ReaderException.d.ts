import { Exception } from './Exception.js';
import 'ts-custom-error';

/**
 * Custom Error class of type Exception.
 */
declare class ReaderException extends Exception {
    static readonly kind: string;
}

export { ReaderException };
