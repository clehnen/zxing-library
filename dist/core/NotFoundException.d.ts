import { Exception } from './Exception.js';
import 'ts-custom-error';

/**
 * Custom Error class of type Exception.
 */
declare class NotFoundException extends Exception {
    static readonly kind: string;
    static getNotFoundInstance(): NotFoundException;
}

export { NotFoundException };
