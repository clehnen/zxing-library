import { BitArray } from '../../../../common/BitArray.cjs';
import { GeneralAppIdDecoder } from './GeneralAppIdDecoder.cjs';
import '../../../../util/StringBuilder.cjs';
import '../../../../common/CharacterSetECI.cjs';
import '../../../../../customTypings.cjs';
import './DecodedInformation.cjs';
import './DecodedObject.cjs';

declare abstract class AbstractExpandedDecoder {
    private readonly information;
    private readonly generalDecoder;
    constructor(information: BitArray);
    protected getInformation(): BitArray;
    protected getGeneralDecoder(): GeneralAppIdDecoder;
    abstract parseInformation(): string;
}

export { AbstractExpandedDecoder };
