/**
 * Lookup table which factors to use for which number of error correction codewords.
 * See FACTORS.
 */
declare const FACTOR_SETS: number[];
/**
 * Precomputed polynomial factors for ECC 200.
 */
declare const FACTORS: number[][];
declare const /*final*/ MODULO_VALUE: number;
declare const LOG: number[];
declare const ALOG: number[];
declare const enum SymbolShapeHint {
    FORCE_NONE = 0,
    FORCE_SQUARE = 1,
    FORCE_RECTANGLE = 2
}
/**
 * Padding character
 */
declare const PAD = 129;
/**
 * mode latch to C40 encodation mode
 */
declare const LATCH_TO_C40 = 230;
/**
 * mode latch to Base 256 encodation mode
 */
declare const LATCH_TO_BASE256 = 231;
/**
 * FNC1 Codeword
 */
/**
 * Structured Append Codeword
 */
/**
 * Reader Programming
 */
/**
 * Upper Shift
 */
declare const UPPER_SHIFT = 235;
/**
 * 05 Macro
 */
declare const MACRO_05 = 236;
/**
 * 06 Macro
 */
declare const MACRO_06 = 237;
/**
 * mode latch to ANSI X.12 encodation mode
 */
declare const LATCH_TO_ANSIX12 = 238;
/**
 * mode latch to Text encodation mode
 */
declare const LATCH_TO_TEXT = 239;
/**
 * mode latch to EDIFACT encodation mode
 */
declare const LATCH_TO_EDIFACT = 240;
/**
 * ECI character (Extended Channel Interpretation)
 */
/**
 * Unlatch from C40 encodation
 */
declare const C40_UNLATCH = 254;
/**
 * Unlatch from X12 encodation
 */
declare const X12_UNLATCH = 254;
/**
 * 05 Macro header
 */
declare const MACRO_05_HEADER = "[)>\u001E05\u001D";
/**
 * 06 Macro header
 */
declare const MACRO_06_HEADER = "[)>\u001E06\u001D";
/**
 * Macro trailer
 */
declare const MACRO_TRAILER = "\u001E\u0004";
declare const ASCII_ENCODATION = 0;
declare const C40_ENCODATION = 1;
declare const TEXT_ENCODATION = 2;
declare const X12_ENCODATION = 3;
declare const EDIFACT_ENCODATION = 4;
declare const BASE256_ENCODATION = 5;

export { ALOG, ASCII_ENCODATION, BASE256_ENCODATION, C40_ENCODATION, C40_UNLATCH, EDIFACT_ENCODATION, FACTORS, FACTOR_SETS, LATCH_TO_ANSIX12, LATCH_TO_BASE256, LATCH_TO_C40, LATCH_TO_EDIFACT, LATCH_TO_TEXT, LOG, MACRO_05, MACRO_05_HEADER, MACRO_06, MACRO_06_HEADER, MACRO_TRAILER, MODULO_VALUE, PAD, SymbolShapeHint, TEXT_ENCODATION, UPPER_SHIFT, X12_ENCODATION, X12_UNLATCH };
