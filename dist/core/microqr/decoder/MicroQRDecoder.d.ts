import { BitMatrix } from '../../common/BitMatrix.js';
import { DecoderResult } from '../../common/DecoderResult.js';
import { DecodeHintType } from '../../DecodeHintType.js';
import '../../common/BitArray.js';
import '../../../customTypings.js';

/**
 * Orchestrates Micro QR Code decoding:
 *   1. Parse format info and codewords from the bit matrix
 *   2. Reed-Solomon error correction (RS for M2-M4; skip for M1)
 *   3. Decode bit stream to text
 */
declare class MicroQRDecoder {
    private readonly rsDecoder;
    constructor();
    decodeBitMatrix(bits: BitMatrix, hints?: Map<DecodeHintType, any>): DecoderResult;
    private correctErrors;
}

export { MicroQRDecoder };
