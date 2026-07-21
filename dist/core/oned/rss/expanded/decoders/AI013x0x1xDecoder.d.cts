import { AI01weightDecoder } from './AI01weightDecoder.cjs';
import { BitArray } from '../../../../common/BitArray.cjs';
import { ZXingStringBuilder } from '../../../../util/StringBuilder.cjs';
import './AI01decoder.cjs';
import './AbstractExpandedDecoder.cjs';
import './GeneralAppIdDecoder.cjs';
import './DecodedInformation.cjs';
import './DecodedObject.cjs';
import '../../../../common/CharacterSetECI.cjs';
import '../../../../../customTypings.cjs';

declare class AI013x0x1xDecoder extends AI01weightDecoder {
    private static readonly HEADER_SIZE;
    private static readonly WEIGHT_SIZE;
    private static readonly DATE_SIZE;
    private readonly dateCode;
    private readonly firstAIdigits;
    constructor(information: BitArray, firstAIdigits: string, dateCode: string);
    parseInformation(): string;
    private encodeCompressedDate;
    protected addWeightCode(buf: ZXingStringBuilder, weight: number): void;
    protected checkWeight(weight: number): number;
}

export { AI013x0x1xDecoder };
