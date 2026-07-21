import { DataCharacter } from '../DataCharacter.js';
import { FinderPattern } from '../FinderPattern.js';
import '../../../ResultPoint.js';
import '../../../../customTypings.js';

declare class ExpandedPair {
    private readonly leftChar;
    private readonly rightChar;
    private readonly finderPattern;
    constructor(leftChar: DataCharacter | null, rightChar: DataCharacter | null, finderPatter: FinderPattern | null);
    getLeftChar(): DataCharacter | null;
    getRightChar(): DataCharacter | null;
    getFinderPattern(): FinderPattern | null;
    mustBeLast(): boolean;
    toString(): String;
    static equals(o1: ExpandedPair | null, o2: any): boolean;
    hashCode(): number;
    private static hashNotNull;
}

export { ExpandedPair };
