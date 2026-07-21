import { Encoder } from './Encoder.js';
import { EncoderContext } from './EncoderContext.js';
import '../../util/StringBuilder.js';
import '../../common/CharacterSetECI.js';
import '../../../customTypings.js';
import '../../Dimension.js';
import './constants.js';
import './DataMatrixSymbolInfo.js';

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
