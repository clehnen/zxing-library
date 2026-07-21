import { AI013x0xDecoder } from './AI013x0xDecoder.cjs';
import { BitArray } from '../../../../common/BitArray.cjs';
import { ZXingStringBuilder } from '../../../../util/StringBuilder.cjs';
import './AI01weightDecoder.cjs';
import './AI01decoder.cjs';
import './AbstractExpandedDecoder.cjs';
import './GeneralAppIdDecoder.cjs';
import './DecodedInformation.cjs';
import './DecodedObject.cjs';
import '../../../../common/CharacterSetECI.cjs';
import '../../../../../customTypings.cjs';

declare class AI013103decoder extends AI013x0xDecoder {
    constructor(information: BitArray);
    protected addWeightCode(buf: ZXingStringBuilder, weight: number): void;
    protected checkWeight(weight: number): number;
}

export { AI013103decoder };
