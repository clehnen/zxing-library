import { Exception } from './Exception.cjs';
import 'ts-custom-error';

/**
 * Custom Error class of type Exception.
 */
declare class ArithmeticException extends Exception {
    static readonly kind: string;
}

export { ArithmeticException };
