import { BitArray } from '../../common/BitArray.cjs';
import { Token } from './Token.cjs';
import { SimpleToken } from './SimpleToken.cjs';
import { int } from '../../../customTypings.cjs';

declare class BinaryShiftToken extends SimpleToken {
    private binaryShiftStart;
    private binaryShiftByteCount;
    constructor(previous: Token, binaryShiftStart: int, binaryShiftByteCount: int);
    /**
     * @Override
     */
    appendTo(bitArray: BitArray, text: Uint8Array): void;
    addBinaryShift(start: int, byteCount: int): Token;
    /**
     * @Override
     */
    toString(): string;
}

export { BinaryShiftToken };
