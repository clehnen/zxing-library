import { Reader } from '../Reader.cjs';
import { Result } from '../Result.cjs';
import { BinaryBitmap } from '../BinaryBitmap.cjs';
import { DecodeHintType } from '../DecodeHintType.cjs';
import '../Binarizer.cjs';
import '../LuminanceSource.cjs';
import '../common/BitArray.cjs';
import '../common/BitMatrix.cjs';
import '../../customTypings.cjs';
import '../ResultPoint.cjs';
import '../BarcodeFormat.cjs';
import '../ResultMetadataType.cjs';

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
