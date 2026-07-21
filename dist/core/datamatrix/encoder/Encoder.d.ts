import { EncoderContext } from './EncoderContext.js';
import '../../util/StringBuilder.js';
import '../../common/CharacterSetECI.js';
import '../../../customTypings.js';
import '../../Dimension.js';
import './constants.js';
import './DataMatrixSymbolInfo.js';

interface Encoder {
    getEncodingMode(): number;
    encode(context: EncoderContext): void;
}

export type { Encoder };
