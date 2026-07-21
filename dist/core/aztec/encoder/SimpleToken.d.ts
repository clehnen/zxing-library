import { BitArray } from '../../common/BitArray.js';
import { Token } from './Token.js';
import { int } from '../../../customTypings.js';

declare class SimpleToken extends Token {
    private value;
    private bitCount;
    constructor(previous: Token, value: int, bitCount: int);
    /**
     * @Override
     */
    appendTo(bitArray: BitArray, text: Uint8Array): void;
    add(value: int, bitCount: int): Token;
    addBinaryShift(start: int, byteCount: int): Token;
    /**
     * @Override
     */
    toString(): String;
}

export { SimpleToken };
