import { Encoder } from './Encoder.js';
import { EncoderContext } from './EncoderContext.js';
import '../../util/StringBuilder.js';
import '../../common/CharacterSetECI.js';
import '../../../customTypings.js';
import '../../Dimension.js';
import './constants.js';
import './DataMatrixSymbolInfo.js';

declare class ASCIIEncoder implements Encoder {
    getEncodingMode(): number;
    encode(context: EncoderContext): void;
    private encodeASCIIDigits;
}

export { ASCIIEncoder };
