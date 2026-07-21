import { AI01decoder } from './AI01decoder.js';
import { BitArray } from '../../../../common/BitArray.js';
import '../../../../util/StringBuilder.js';
import '../../../../common/CharacterSetECI.js';
import '../../../../../customTypings.js';
import './AbstractExpandedDecoder.js';
import './GeneralAppIdDecoder.js';
import './DecodedInformation.js';
import './DecodedObject.js';

declare class AI01393xDecoder extends AI01decoder {
    private static readonly HEADER_SIZE;
    private static readonly LAST_DIGIT_SIZE;
    private static readonly FIRST_THREE_DIGITS_SIZE;
    constructor(information: BitArray);
    parseInformation(): string;
}

export { AI01393xDecoder };
