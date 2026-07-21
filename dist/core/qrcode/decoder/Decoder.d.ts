import { BitMatrix } from '../../common/BitMatrix.js';
import { DecoderResult } from '../../common/DecoderResult.js';
import { DecodeHintType } from '../../DecodeHintType.js';
import '../../common/BitArray.js';
import '../../../customTypings.js';

/**
 * <p>The main class which implements QR Code decoding -- as opposed to locating and extracting
 * the QR Code from an image.</p>
 *
 * @author Sean Owen
 */
declare class Decoder {
    private rsDecoder;
    constructor();
    /**
     * <p>Convenience method that can decode a QR Code represented as a 2D array of booleans.
     * "true" is taken to mean a black module.</p>
     *
     * @param image booleans representing white/black QR Code modules
     * @param hints decoding hints that should be used to influence decoding
     * @return text and bytes encoded within the QR Code
     * @throws FormatException if the QR Code cannot be decoded
     * @throws ChecksumException if error correction fails
     */
    decodeBooleanArray(image: boolean[][], hints?: Map<DecodeHintType, any>): DecoderResult;
    /**
     * <p>Decodes a QR Code represented as a {@link BitMatrix}. A 1 or "true" is taken to mean a black module.</p>
     *
     * @param bits booleans representing white/black QR Code modules
     * @param hints decoding hints that should be used to influence decoding
     * @return text and bytes encoded within the QR Code
     * @throws FormatException if the QR Code cannot be decoded
     * @throws ChecksumException if error correction fails
     */
    decodeBitMatrix(bits: BitMatrix, hints?: Map<DecodeHintType, any>): DecoderResult;
    private decodeBitMatrixParser;
    /**
     * <p>Given data and error-correction codewords received, possibly corrupted by errors, attempts to
     * correct the errors in-place using Reed-Solomon error correction.</p>
     *
     * @param codewordBytes data and error correction codewords
     * @param numDataCodewords number of codewords that are data bytes
     * @throws ChecksumException if error correction fails
     */
    private correctErrors;
}

export { Decoder };
