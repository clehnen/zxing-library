import { Exception } from './Exception.js';
import 'ts-custom-error';

/**
 * Custom Error class of type Exception.
 */
declare class OutOfMemoryError extends Exception {
}

export { OutOfMemoryError };
