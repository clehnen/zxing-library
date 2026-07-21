import { BitArray } from '../../../../common/BitArray.js';
import { GeneralAppIdDecoder } from './GeneralAppIdDecoder.js';
import '../../../../util/StringBuilder.js';
import '../../../../common/CharacterSetECI.js';
import '../../../../../customTypings.js';
import './DecodedInformation.js';
import './DecodedObject.js';

declare abstract class AbstractExpandedDecoder {
    private readonly information;
    private readonly generalDecoder;
    constructor(information: BitArray);
    protected getInformation(): BitArray;
    protected getGeneralDecoder(): GeneralAppIdDecoder;
    abstract parseInformation(): string;
}

export { AbstractExpandedDecoder };
