import { char } from '../../customTypings.js';
import { ZXingCharset } from '../util/ZXingCharset.js';
import './CharacterSetECI.js';

/**
 * Set of CharsetEncoders for a given input string
 *
 * Invariants:
 * - The list contains only encoders from CharacterSetECI (list is shorter then the list of encoders available on
 *   the platform for which ECI values are defined).
 * - The list contains encoders at least one encoder for every character in the input.
 * - The first encoder in the list is always the ISO-8859-1 encoder even of no character in the input can be encoded
 *       by it.
 * - If the input contains a character that is not in ISO-8859-1 then the last two entries in the list will be the
 *   UTF-8 encoder and the UTF-16BE encoder.
 *
 * @author Alex Geller
 */

declare class ECIEncoderSet {
    private readonly ENCODERS;
    private encoders;
    private priorityEncoderIndex;
    /**
     * Constructs an encoder set
     *
     * @param stringToEncode the string that needs to be encoded
     * @param priorityCharset The preferred {@link ZXingCharset} or null.
     * @param fnc1 fnc1 denotes the character in the input that represents the FNC1 character or -1 for a non-GS1 bar
     * code. When specified, it is considered an error to pass it as argument to the methods canEncode() or encode().
     */
    constructor(stringToEncode: string, priorityCharset: ZXingCharset, fnc1: number);
    length(): number;
    getCharsetName(index: number): string;
    getCharset(index: number): ZXingCharset;
    getECIValue(encoderIndex: number): number;
    getPriorityEncoderIndex(): number;
    canEncode(c: char, encoderIndex: number): boolean;
    encode(c: char, encoderIndex: number): Uint8Array;
}

export { ECIEncoderSet };
