import { Encoder } from './Encoder.cjs';
import { EncoderContext } from './EncoderContext.cjs';
import '../../util/StringBuilder.cjs';
import '../../common/CharacterSetECI.cjs';
import '../../../customTypings.cjs';
import '../../Dimension.cjs';
import './constants.cjs';
import './DataMatrixSymbolInfo.cjs';

declare class Base256Encoder implements Encoder {
    getEncodingMode(): number;
    encode(context: EncoderContext): void;
    private randomize255State;
}

export { Base256Encoder };
