import { DataCharacter } from './DataCharacter.js';
import { FinderPattern } from './FinderPattern.js';
import '../../ResultPoint.js';
import '../../../customTypings.js';

declare class Pair extends DataCharacter {
    private finderPattern;
    private count;
    constructor(value: number, checksumPortion: number, finderPattern: FinderPattern);
    getFinderPattern(): FinderPattern;
    getCount(): number;
    incrementCount(): void;
}

export { Pair };
