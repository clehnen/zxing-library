import { ZXingStringBuilder } from '../../util/StringBuilder.cjs';
import { char } from '../../../customTypings.cjs';
import { Encoder } from './Encoder.cjs';
import { EncoderContext } from './EncoderContext.cjs';
import '../../common/CharacterSetECI.cjs';
import '../../Dimension.cjs';
import './constants.cjs';
import './DataMatrixSymbolInfo.cjs';

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
