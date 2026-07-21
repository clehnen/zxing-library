import { AI01decoder } from './AI01decoder.cjs';
import { BitArray } from '../../../../common/BitArray.cjs';
import '../../../../util/StringBuilder.cjs';
import '../../../../common/CharacterSetECI.cjs';
import '../../../../../customTypings.cjs';
import './AbstractExpandedDecoder.cjs';
import './GeneralAppIdDecoder.cjs';
import './DecodedInformation.cjs';
import './DecodedObject.cjs';

declare class AI01392xDecoder extends AI01decoder {
    private static readonly HEADER_SIZE;
    private static readonly LAST_DIGIT_SIZE;
    constructor(information: BitArray);
    parseInformation(): string;
}

export { AI01392xDecoder };
