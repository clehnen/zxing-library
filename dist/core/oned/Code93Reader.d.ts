import { BitArray } from '../common/BitArray.js';
import { DecodeHintType } from '../DecodeHintType.js';
import { OneDReader } from './OneDReader.js';
import { Result } from '../Result.js';
import '../BinaryBitmap.js';
import '../Binarizer.js';
import '../LuminanceSource.js';
import '../common/BitMatrix.js';
import '../../customTypings.js';
import '../Reader.js';
import '../ResultPoint.js';
import '../BarcodeFormat.js';
import '../ResultMetadataType.js';

/**
 * <p>Decodes Code 93 barcodes.</p>
 *
 * @author Sean Owen
 * @see Code39Reader
 */
declare class Code93Reader extends OneDReader {
    private static readonly ALPHABET_STRING;
    /**
     * These represent the encodings of characters, as patterns of wide and narrow bars.
     * The 9 least-significant bits of each int correspond to the pattern of wide and narrow.
     */
    private static readonly CHARACTER_ENCODINGS;
    private static readonly ASTERISK_ENCODING;
    private decodeRowResult;
    private counters;
    constructor();
    decodeRow(rowNumber: number, row: BitArray, hints?: Map<DecodeHintType, any>): Result;
    private findAsteriskPattern;
    private toPattern;
    private patternToChar;
    private decodeExtended;
    private checkChecksums;
    private checkOneChecksum;
}

export { Code93Reader };
