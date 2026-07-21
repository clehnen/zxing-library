import { DataCharacter } from './DataCharacter.cjs';
import { FinderPattern } from './FinderPattern.cjs';
import '../../ResultPoint.cjs';
import '../../../customTypings.cjs';

declare class Pair extends DataCharacter {
    private finderPattern;
    private count;
    constructor(value: number, checksumPortion: number, finderPattern: FinderPattern);
    getFinderPattern(): FinderPattern;
    getCount(): number;
    incrementCount(): void;
}

export { Pair };
