import { Exception } from './Exception.js';
import 'ts-custom-error';

/**
 * Custom Error class of type Exception.
 */
declare class ChecksumException extends Exception {
    static readonly kind: string;
    static getChecksumInstance(): ChecksumException;
}

export { ChecksumException };
