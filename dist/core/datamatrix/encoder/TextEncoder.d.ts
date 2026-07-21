import { ZXingStringBuilder } from '../../util/StringBuilder.js';
import { char } from '../../../customTypings.js';
import { C40Encoder } from './C40Encoder.js';
import '../../common/CharacterSetECI.js';
import './Encoder.js';
import './EncoderContext.js';
import '../../Dimension.js';
import './constants.js';
import './DataMatrixSymbolInfo.js';

declare class TextEncoder extends C40Encoder {
    getEncodingMode(): number;
    encodeChar(c: char, sb: ZXingStringBuilder): number;
}

export { TextEncoder };
