import { Token } from './Token.cjs';
import '../../common/BitArray.cjs';
import '../../../customTypings.cjs';

declare function addBinaryShift(token: Token, start: number, byteCount: number): Token;
declare function add(token: Token, value: number, bitCount: number): Token;

export { add, addBinaryShift };
