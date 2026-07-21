import { BinaryBitmap } from '../BinaryBitmap.cjs';
import { DecodeHintType } from '../DecodeHintType.cjs';
import { Reader } from '../Reader.cjs';
import { Result } from '../Result.cjs';
import '../Binarizer.cjs';
import '../LuminanceSource.cjs';
import '../common/BitArray.cjs';
import '../common/BitMatrix.cjs';
import '../../customTypings.cjs';
import '../ResultPoint.cjs';
import '../BarcodeFormat.cjs';
import '../ResultMetadataType.cjs';

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
