import { Token } from './Token.js';
import '../../common/BitArray.js';
import '../../../customTypings.js';

declare function addBinaryShift(token: Token, start: number, byteCount: number): Token;
declare function add(token: Token, value: number, bitCount: number): Token;

export { add, addBinaryShift };
