import { Exception } from './Exception.cjs';
import 'ts-custom-error';

/**
 * Custom Error class of type Exception.
 */
declare class WriterException extends Exception {
    static readonly kind: string;
}

export { WriterException };
