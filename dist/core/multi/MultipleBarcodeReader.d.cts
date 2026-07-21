import { BinaryBitmap } from '../BinaryBitmap.cjs';
import { DecodeHintType } from '../DecodeHintType.cjs';
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
