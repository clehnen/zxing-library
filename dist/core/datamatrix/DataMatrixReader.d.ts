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
 * This implementation can detect and decode Data Matrix codes in an image.
 *
 * @author bbrown@google.com (Brian Brown)
 */
declare class DataMatrixReader implements Reader {
    private static NO_POINTS;
    private decoder;
    /**
     * Locates and decodes a Data Matrix code in an image.
     *
     * @return a String representing the content encoded by the Data Matrix code
     * @throws NotFoundException if a Data Matrix code cannot be found
     * @throws FormatException if a Data Matrix code cannot be decoded
     * @throws ChecksumException if error correction fails
     */
    decode(image: BinaryBitmap, hints?: Map<DecodeHintType, any> | null): Result;
    reset(): void;
    /**
     * This method detects a code in a "pure" image -- that is, pure monochrome image
     * which contains only an unrotated, unskewed, image of a code, with some white border
     * around it. This is a specialized method that works exceptionally fast in this special
     * case.
     *
     * @see com.google.zxing.qrcode.QRCodeReader#extractPureBits(BitMatrix)
     */
    private static extractPureBits;
    private static moduleSize;
}

export { DataMatrixReader };
