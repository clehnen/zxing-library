import { BitArray } from '../../../../common/BitArray.cjs';
import { ZXingStringBuilder } from '../../../../util/StringBuilder.cjs';
import { AbstractExpandedDecoder } from './AbstractExpandedDecoder.cjs';
import '../../../../common/CharacterSetECI.cjs';
import '../../../../../customTypings.cjs';
import './GeneralAppIdDecoder.cjs';
import './DecodedInformation.cjs';
import './DecodedObject.cjs';

declare abstract class AI01decoder extends AbstractExpandedDecoder {
    static readonly GTIN_SIZE: number;
    constructor(information: BitArray);
    encodeCompressedGtin(buf: ZXingStringBuilder, currentPos: number): void;
    encodeCompressedGtinWithoutAI(buf: ZXingStringBuilder, currentPos: number, initialBufferPosition: number): void;
    private static appendCheckDigit;
}

export { AI01decoder };
