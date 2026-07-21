import { BitArray } from '../common/BitArray.cjs';
import { DecodeHintType } from '../DecodeHintType.cjs';
import { OneDReader } from './OneDReader.cjs';
import { Result } from '../Result.cjs';
import '../BinaryBitmap.cjs';
import '../Binarizer.cjs';
import '../LuminanceSource.cjs';
import '../common/BitMatrix.cjs';
import '../../customTypings.cjs';
import '../Reader.cjs';
import '../ResultPoint.cjs';
import '../BarcodeFormat.cjs';
import '../ResultMetadataType.cjs';

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
