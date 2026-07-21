import { EncoderContext } from './EncoderContext.cjs';
import '../../util/StringBuilder.cjs';
import '../../common/CharacterSetECI.cjs';
import '../../../customTypings.cjs';
import '../../Dimension.cjs';
import './constants.cjs';
import './DataMatrixSymbolInfo.cjs';

interface Encoder {
    getEncodingMode(): number;
    encode(context: EncoderContext): void;
}

export type { Encoder };
