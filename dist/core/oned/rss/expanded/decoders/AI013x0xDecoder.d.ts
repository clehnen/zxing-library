import { AI01weightDecoder } from './AI01weightDecoder.js';
import { BitArray } from '../../../../common/BitArray.js';
import '../../../../util/StringBuilder.js';
import '../../../../common/CharacterSetECI.js';
import '../../../../../customTypings.js';
import './AI01decoder.js';
import './AbstractExpandedDecoder.js';
import './GeneralAppIdDecoder.js';
import './DecodedInformation.js';
import './DecodedObject.js';

declare abstract class AI013x0xDecoder extends AI01weightDecoder {
    private static readonly HEADER_SIZE;
    private static readonly WEIGHT_SIZE;
    constructor(information: BitArray);
    parseInformation(): string;
}

export { AI013x0xDecoder };
