import { BitArray } from '../../../../common/BitArray.js';
import { AbstractExpandedDecoder } from './AbstractExpandedDecoder.js';
import './GeneralAppIdDecoder.js';
import '../../../../util/StringBuilder.js';
import '../../../../common/CharacterSetECI.js';
import '../../../../../customTypings.js';
import './DecodedInformation.js';
import './DecodedObject.js';

declare class AnyAIDecoder extends AbstractExpandedDecoder {
    private static readonly HEADER_SIZE;
    constructor(information: BitArray);
    parseInformation(): string;
}

export { AnyAIDecoder };
