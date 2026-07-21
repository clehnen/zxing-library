import { Token } from './Token.js';
import { int } from '../../../customTypings.js';
import '../../common/BitArray.js';

declare const /*final*/ MODE_NAMES: String[];
declare const /*final*/ MODE_UPPER: int;
declare const /*final*/ MODE_LOWER: int;
declare const /*final*/ MODE_DIGIT: int;
declare const /*final*/ MODE_MIXED: int;
declare const /*final*/ MODE_PUNCT: int;
declare const EMPTY_TOKEN: Token;
declare const _default: {
    MODE_NAMES: String[];
    MODE_UPPER: number;
    MODE_LOWER: number;
    MODE_DIGIT: number;
    MODE_MIXED: number;
    MODE_PUNCT: number;
    EMPTY_TOKEN: Token;
};

export { EMPTY_TOKEN, MODE_DIGIT, MODE_LOWER, MODE_MIXED, MODE_NAMES, MODE_PUNCT, MODE_UPPER, _default as default };
