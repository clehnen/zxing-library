import { Exception } from './Exception.cjs';
import 'ts-custom-error';

/**
 * Custom Error class of type Exception.
 */
declare class NullPointerException extends Exception {
    static readonly kind: string;
}

export { NullPointerException };
