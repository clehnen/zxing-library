import { BitArray } from '../../../common/BitArray.js';
import { ExpandedPair } from './ExpandedPair.js';
import '../DataCharacter.js';
import '../FinderPattern.js';
import '../../../ResultPoint.js';
import '../../../../customTypings.js';

declare class BitArrayBuilder {
    static buildBitArray(pairs: Array<ExpandedPair>): BitArray;
}

export { BitArrayBuilder };
