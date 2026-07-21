import { BinaryBitmap } from '../BinaryBitmap.cjs';
import { DecodeHintType } from '../DecodeHintType.cjs';
import { Reader } from '../Reader.cjs';
import { Result } from '../Result.cjs';
import { Decoder } from './decoder/Decoder.cjs';
import '../Binarizer.cjs';
import '../LuminanceSource.cjs';
import '../common/BitArray.cjs';
import '../common/BitMatrix.cjs';
import '../../customTypings.cjs';
import '../ResultPoint.cjs';
import '../BarcodeFormat.cjs';
import '../ResultMetadataType.cjs';
import '../common/DecoderResult.cjs';

/**
 * This implementation can detect and decode QR Codes in an image.
 *
 * @author Sean Owen
 */
declare class QRCodeReader implements Reader {
    private static NO_POINTS;
    private decoder;
    protected getDecoder(): Decoder;
    /**
     * Locates and decodes a QR code in an image.
     *
     * @return a representing: string the content encoded by the QR code
     * @throws NotFoundException if a QR code cannot be found
     * @throws FormatException if a QR code cannot be decoded
     * @throws ChecksumException if error correction fails
     */
    decode(image: BinaryBitmap, hints?: Map<DecodeHintType, any>): Result;
    reset(): void;
    /**
     * This method detects a code in a "pure" image -- that is, pure monochrome image
     * which contains only an unrotated, unskewed, image of a code, with some white border
     * around it. This is a specialized method that works exceptionally fast in this special
     * case.
     *
     * @see com.google.zxing.datamatrix.DataMatrixReader#extractPureBits(BitMatrix)
     */
    private static extractPureBits;
    private static moduleSize;
}

export { QRCodeReader };
