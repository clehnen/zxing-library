import { BinaryBitmap } from '../BinaryBitmap.js';
import { DecodeHintType } from '../DecodeHintType.js';
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
 * Implementation of this interface attempt to read several barcodes from one image.
 *
 * @see com.google.zxing.Reader
 * @author Sean Owen
 */
interface MultipleBarcodeReader {
    /**
     * @throws NotFoundException
     */
    decodeMultiple(image: BinaryBitmap): Result[];
    /**
     * @throws NotFoundException
     */
    decodeMultiple(image: BinaryBitmap, hints: Map<DecodeHintType, any>): Result[];
}

export type { MultipleBarcodeReader };
