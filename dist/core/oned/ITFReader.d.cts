import { BitArray } from '../common/BitArray.cjs';
import { DecodeHintType } from '../DecodeHintType.cjs';
import { Result } from '../Result.cjs';
import { OneDReader } from './OneDReader.cjs';
import '../ResultPoint.cjs';
import '../../customTypings.cjs';
import '../BarcodeFormat.cjs';
import '../ResultMetadataType.cjs';
import '../BinaryBitmap.cjs';
import '../Binarizer.cjs';
import '../LuminanceSource.cjs';
import '../common/BitMatrix.cjs';
import '../Reader.cjs';

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
