import { AI013x0xDecoder } from './AI013x0xDecoder.js';
import { BitArray } from '../../../../common/BitArray.js';
import { ZXingStringBuilder } from '../../../../util/StringBuilder.js';
import './AI01weightDecoder.js';
import './AI01decoder.js';
import './AbstractExpandedDecoder.js';
import './GeneralAppIdDecoder.js';
import './DecodedInformation.js';
import './DecodedObject.js';
import '../../../../common/CharacterSetECI.js';
import '../../../../../customTypings.js';

declare class AI013103decoder extends AI013x0xDecoder {
    constructor(information: BitArray);
    protected addWeightCode(buf: ZXingStringBuilder, weight: number): void;
    protected checkWeight(weight: number): number;
}

export { AI013103decoder };
