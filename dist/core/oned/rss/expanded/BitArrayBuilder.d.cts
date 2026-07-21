import { BitArray } from '../../../common/BitArray.cjs';
import { ExpandedPair } from './ExpandedPair.cjs';
import '../DataCharacter.cjs';
import '../FinderPattern.cjs';
import '../../../ResultPoint.cjs';
import '../../../../customTypings.cjs';

declare class BitArrayBuilder {
    static buildBitArray(pairs: Array<ExpandedPair>): BitArray;
}

export { BitArrayBuilder };
