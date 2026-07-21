import { BitArray } from '../common/BitArray.js';
import { DecodeHintType } from '../DecodeHintType.js';
import { Result } from '../Result.js';
import { OneDReader } from './OneDReader.js';
import '../ResultPoint.js';
import '../../customTypings.js';
import '../BarcodeFormat.js';
import '../ResultMetadataType.js';
import '../BinaryBitmap.js';
import '../Binarizer.js';
import '../LuminanceSource.js';
import '../common/BitMatrix.js';
import '../Reader.js';

/**
 * <p>Decodes ITF barcodes.</p>
 *
 * @author Tjieco
 */
declare class ITFReader extends OneDReader {
    private static PATTERNS;
    private static MAX_AVG_VARIANCE;
    private static MAX_INDIVIDUAL_VARIANCE;
    private static DEFAULT_ALLOWED_LENGTHS;
    private narrowLineWidth;
    private static START_PATTERN;
    private static END_PATTERN_REVERSED;
    decodeRow(rowNumber: number, row: BitArray, hints?: Map<DecodeHintType, any>): Result;
    private static decodeMiddle;
    private decodeStart;
    private validateQuietZone;
    private static skipWhiteSpace;
    private decodeEnd;
    private static findGuardPattern;
    private static decodeDigit;
}

export { ITFReader };
