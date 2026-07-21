import { ZXingStringBuilder } from '../../util/StringBuilder.js';
import { char } from '../../../customTypings.js';
import { Encoder } from './Encoder.js';
import { EncoderContext } from './EncoderContext.js';
import '../../common/CharacterSetECI.js';
import '../../Dimension.js';
import './constants.js';
import './DataMatrixSymbolInfo.js';

declare class C40Encoder implements Encoder {
    getEncodingMode(): number;
    encodeMaximal(context: EncoderContext): void;
    encode(context: EncoderContext): void;
    backtrackOneCharacter(context: EncoderContext, buffer: ZXingStringBuilder, removed: ZXingStringBuilder, lastCharSize: number): number;
    writeNextTriplet(context: EncoderContext, buffer: ZXingStringBuilder): void;
    /**
     * Handle "end of data" situations
     *
     * @param context the encoder context
     * @param buffer  the buffer with the remaining encoded characters
     */
    handleEOD(context: EncoderContext, buffer: ZXingStringBuilder): void;
    encodeChar(c: char, sb: ZXingStringBuilder): number;
    private encodeToCodewords;
}

export { C40Encoder };
