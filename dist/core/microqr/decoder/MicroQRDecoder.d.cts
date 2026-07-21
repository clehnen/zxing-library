import { BitMatrix } from '../../common/BitMatrix.cjs';
import { DecoderResult } from '../../common/DecoderResult.cjs';
import { DecodeHintType } from '../../DecodeHintType.cjs';
import '../../common/BitArray.cjs';
import '../../../customTypings.cjs';

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
