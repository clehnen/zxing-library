import { AI01weightDecoder } from './AI01weightDecoder.cjs';
import { BitArray } from '../../../../common/BitArray.cjs';
import '../../../../util/StringBuilder.cjs';
import '../../../../common/CharacterSetECI.cjs';
import '../../../../../customTypings.cjs';
import './AI01decoder.cjs';
import './AbstractExpandedDecoder.cjs';
import './GeneralAppIdDecoder.cjs';
import './DecodedInformation.cjs';
import './DecodedObject.cjs';

declare abstract class AI013x0xDecoder extends AI01weightDecoder {
    private static readonly HEADER_SIZE;
    private static readonly WEIGHT_SIZE;
    constructor(information: BitArray);
    parseInformation(): string;
}

export { AI013x0xDecoder };
