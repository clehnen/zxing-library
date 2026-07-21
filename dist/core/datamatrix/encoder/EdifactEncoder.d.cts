import { Encoder } from './Encoder.cjs';
import { EncoderContext } from './EncoderContext.cjs';
import '../../util/StringBuilder.cjs';
import '../../common/CharacterSetECI.cjs';
import '../../../customTypings.cjs';
import '../../Dimension.cjs';
import './constants.cjs';
import './DataMatrixSymbolInfo.cjs';

declare class EdifactEncoder implements Encoder {
    getEncodingMode(): number;
    encode(context: EncoderContext): void;
    /**
     * Handle "end of data" situations
     *
     * @param context the encoder context
     * @param buffer  the buffer with the remaining encoded characters
     */
    private handleEOD;
    private encodeChar;
    private encodeToCodewords;
}

export { EdifactEncoder };
