import { BinaryBitmap } from '../BinaryBitmap.js';
import { DecodeHintType } from '../DecodeHintType.js';
import { Reader } from '../Reader.js';
import { Result } from '../Result.js';
import '../Binarizer.js';
import '../LuminanceSource.js';
import '../common/BitArray.js';
import '../common/BitMatrix.js';
import '../../customTypings.js';
import '../ResultPoint.js';
import '../BarcodeFormat.js';
import '../ResultMetadataType.js';

/**
 * This implementation can detect and decode a MaxiCode in an image.
 */
declare class MaxiCodeReader implements Reader {
    private static readonly NO_POINTS;
    private static readonly MATRIX_WIDTH;
    private static readonly MATRIX_HEIGHT;
    private decoder;
    decode(image: BinaryBitmap, hints?: Map<DecodeHintType, any> | null): Result;
    reset(): void;
    private static extractPureBits;
}

export { MaxiCodeReader };
