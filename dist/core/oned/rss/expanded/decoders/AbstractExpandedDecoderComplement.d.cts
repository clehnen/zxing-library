import { BitArray } from '../../../../common/BitArray.cjs';
import { AbstractExpandedDecoder } from './AbstractExpandedDecoder.cjs';
import './GeneralAppIdDecoder.cjs';
import '../../../../util/StringBuilder.cjs';
import '../../../../common/CharacterSetECI.cjs';
import '../../../../../customTypings.cjs';
import './DecodedInformation.cjs';
import './DecodedObject.cjs';

declare function createAbstractExpandedDecoder(information: BitArray): AbstractExpandedDecoder;

export { createAbstractExpandedDecoder };
