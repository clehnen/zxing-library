import { BitMatrix } from '../../common/BitMatrix.js';
import { DecoderResult } from '../../common/DecoderResult.js';
import { DecodeHintType } from '../../DecodeHintType.js';
import '../../common/BitArray.js';
import '../../../customTypings.js';

/**
 * <p>The main class which implements MaxiCode decoding -- as opposed to locating and extracting
 * the MaxiCode from an image.</p>
 *
 * @author Manuel Kasten
 */
declare class MaxiCodeDecoder {
    private static readonly ALL;
    private static readonly EVEN;
    private static readonly ODD;
    private rsDecoder;
    constructor();
    decode(bits: BitMatrix, hints?: Map<DecodeHintType, any> | null): DecoderResult;
    private correctErrors;
}

export { MaxiCodeDecoder };
