import { char } from '../../../customTypings.cjs';
import { ZXingStringBuilder } from '../../util/StringBuilder.cjs';
import { C40Encoder } from './C40Encoder.cjs';
import { EncoderContext } from './EncoderContext.cjs';
import '../../common/CharacterSetECI.cjs';
import './Encoder.cjs';
import '../../Dimension.cjs';
import './constants.cjs';
import './DataMatrixSymbolInfo.cjs';

declare class X12Encoder extends C40Encoder {
    getEncodingMode(): number;
    encode(context: EncoderContext): void;
    encodeChar(c: char, sb: ZXingStringBuilder): number;
    handleEOD(context: EncoderContext, buffer: ZXingStringBuilder): void;
}

export { X12Encoder };
