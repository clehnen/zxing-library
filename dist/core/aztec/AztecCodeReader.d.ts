import { Reader } from '../Reader.js';
import { Result } from '../Result.js';
import { BinaryBitmap } from '../BinaryBitmap.js';
import { DecodeHintType } from '../DecodeHintType.js';
import '../Binarizer.js';
import '../LuminanceSource.js';
import '../common/BitArray.js';
import '../common/BitMatrix.js';
import '../../customTypings.js';
import '../ResultPoint.js';
import '../BarcodeFormat.js';
import '../ResultMetadataType.js';

/**
 * This implementation can detect and decode Aztec codes in an image.
 *
 * @author David Olivier
 */
declare class AztecCodeReader implements Reader {
    /**
     * Locates and decodes a Data Matrix code in an image.
     *
     * @return a String representing the content encoded by the Data Matrix code
     * @throws NotFoundException if a Data Matrix code cannot be found
     * @throws FormatException if a Data Matrix code cannot be decoded
     */
    decode(image: BinaryBitmap, hints?: Map<DecodeHintType, any> | null): Result;
    private reportFoundResultPoints;
    reset(): void;
}

export { AztecCodeReader };
