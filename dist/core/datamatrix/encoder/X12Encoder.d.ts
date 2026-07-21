import { char } from '../../../customTypings.js';
import { ZXingStringBuilder } from '../../util/StringBuilder.js';
import { C40Encoder } from './C40Encoder.js';
import { EncoderContext } from './EncoderContext.js';
import '../../common/CharacterSetECI.js';
import './Encoder.js';
import '../../Dimension.js';
import './constants.js';
import './DataMatrixSymbolInfo.js';

declare class X12Encoder extends C40Encoder {
    getEncodingMode(): number;
    encode(context: EncoderContext): void;
    encodeChar(c: char, sb: ZXingStringBuilder): number;
    handleEOD(context: EncoderContext, buffer: ZXingStringBuilder): void;
}

export { X12Encoder };
