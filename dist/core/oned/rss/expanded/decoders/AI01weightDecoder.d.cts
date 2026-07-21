import { BitArray } from '../../../../common/BitArray.cjs';
import { ZXingStringBuilder } from '../../../../util/StringBuilder.cjs';
import { AI01decoder } from './AI01decoder.cjs';
import '../../../../common/CharacterSetECI.cjs';
import '../../../../../customTypings.cjs';
import './AbstractExpandedDecoder.cjs';
import './GeneralAppIdDecoder.cjs';
import './DecodedInformation.cjs';
import './DecodedObject.cjs';

declare abstract class AI01weightDecoder extends AI01decoder {
    constructor(information: BitArray);
    encodeCompressedWeight(buf: ZXingStringBuilder, currentPos: number, weightSize: number): void;
    protected abstract addWeightCode(buf: ZXingStringBuilder, weight: number): void;
    protected abstract checkWeight(weight: number): number;
}

export { AI01weightDecoder };
