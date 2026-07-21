import { BitArray } from '../../../../common/BitArray.js';
import { ZXingStringBuilder } from '../../../../util/StringBuilder.js';
import { AbstractExpandedDecoder } from './AbstractExpandedDecoder.js';
import '../../../../common/CharacterSetECI.js';
import '../../../../../customTypings.js';
import './GeneralAppIdDecoder.js';
import './DecodedInformation.js';
import './DecodedObject.js';

declare abstract class AI01decoder extends AbstractExpandedDecoder {
    static readonly GTIN_SIZE: number;
    constructor(information: BitArray);
    encodeCompressedGtin(buf: ZXingStringBuilder, currentPos: number): void;
    encodeCompressedGtinWithoutAI(buf: ZXingStringBuilder, currentPos: number, initialBufferPosition: number): void;
    private static appendCheckDigit;
}

export { AI01decoder };
