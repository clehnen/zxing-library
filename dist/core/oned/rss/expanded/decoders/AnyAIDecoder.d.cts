import { BitArray } from '../../../../common/BitArray.cjs';
import { AbstractExpandedDecoder } from './AbstractExpandedDecoder.cjs';
import './GeneralAppIdDecoder.cjs';
import '../../../../util/StringBuilder.cjs';
import '../../../../common/CharacterSetECI.cjs';
import '../../../../../customTypings.cjs';
import './DecodedInformation.cjs';
import './DecodedObject.cjs';

declare class AnyAIDecoder extends AbstractExpandedDecoder {
    private static readonly HEADER_SIZE;
    constructor(information: BitArray);
    parseInformation(): string;
}

export { AnyAIDecoder };
