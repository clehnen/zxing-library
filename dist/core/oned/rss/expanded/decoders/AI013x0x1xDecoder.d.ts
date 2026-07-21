import { AI01weightDecoder } from './AI01weightDecoder.js';
import { BitArray } from '../../../../common/BitArray.js';
import { ZXingStringBuilder } from '../../../../util/StringBuilder.js';
import './AI01decoder.js';
import './AbstractExpandedDecoder.js';
import './GeneralAppIdDecoder.js';
import './DecodedInformation.js';
import './DecodedObject.js';
import '../../../../common/CharacterSetECI.js';
import '../../../../../customTypings.js';

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
