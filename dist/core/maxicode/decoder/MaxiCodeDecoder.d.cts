import { BitMatrix } from '../../common/BitMatrix.cjs';
import { DecoderResult } from '../../common/DecoderResult.cjs';
import { DecodeHintType } from '../../DecodeHintType.cjs';
import '../../common/BitArray.cjs';
import '../../../customTypings.cjs';

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
