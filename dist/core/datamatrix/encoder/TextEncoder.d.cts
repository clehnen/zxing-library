import { ZXingStringBuilder } from '../../util/StringBuilder.cjs';
import { char } from '../../../customTypings.cjs';
import { C40Encoder } from './C40Encoder.cjs';
import '../../common/CharacterSetECI.cjs';
import './Encoder.cjs';
import './EncoderContext.cjs';
import '../../Dimension.cjs';
import './constants.cjs';
import './DataMatrixSymbolInfo.cjs';

declare class TextEncoder extends C40Encoder {
    getEncodingMode(): number;
    encodeChar(c: char, sb: ZXingStringBuilder): number;
}

export { TextEncoder };
