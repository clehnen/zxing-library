import { DataCharacter } from '../DataCharacter.cjs';
import { FinderPattern } from '../FinderPattern.cjs';
import '../../../ResultPoint.cjs';
import '../../../../customTypings.cjs';

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
