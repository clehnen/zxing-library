import { BitArray } from '../../../../common/BitArray.js';
import { ZXingStringBuilder } from '../../../../util/StringBuilder.js';
import { AI01decoder } from './AI01decoder.js';
import '../../../../common/CharacterSetECI.js';
import '../../../../../customTypings.js';
import './AbstractExpandedDecoder.js';
import './GeneralAppIdDecoder.js';
import './DecodedInformation.js';
import './DecodedObject.js';

declare abstract class AI01weightDecoder extends AI01decoder {
    constructor(information: BitArray);
    encodeCompressedWeight(buf: ZXingStringBuilder, currentPos: number, weightSize: number): void;
    protected abstract addWeightCode(buf: ZXingStringBuilder, weight: number): void;
    protected abstract checkWeight(weight: number): number;
}

export { AI01weightDecoder };
