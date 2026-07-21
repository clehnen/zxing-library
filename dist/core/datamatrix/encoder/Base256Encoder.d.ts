import { Encoder } from './Encoder.js';
import { EncoderContext } from './EncoderContext.js';
import '../../util/StringBuilder.js';
import '../../common/CharacterSetECI.js';
import '../../../customTypings.js';
import '../../Dimension.js';
import './constants.js';
import './DataMatrixSymbolInfo.js';

declare class Base256Encoder implements Encoder {
    getEncodingMode(): number;
    encode(context: EncoderContext): void;
    private randomize255State;
}

export { Base256Encoder };
