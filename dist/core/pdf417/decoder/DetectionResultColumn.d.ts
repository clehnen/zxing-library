import { Codeword } from './Codeword.js';
import { BoundingBox } from './BoundingBox.js';
import { int } from '../../../customTypings.js';
import '../../ResultPoint.js';
import '../../common/BitMatrix.js';
import '../../common/BitArray.js';

/**
 * @author Guenther Grau
 */
declare class DetectionResultColumn {
    private static MAX_NEARBY_DISTANCE;
    private boundingBox;
    private codewords;
    constructor(boundingBox: BoundingBox);
    getCodewordNearby(imageRow: int): Codeword;
    imageRowToCodewordIndex(imageRow: int): int;
    setCodeword(imageRow: int, codeword: Codeword): void;
    getCodeword(imageRow: int): Codeword;
    getBoundingBox(): BoundingBox;
    getCodewords(): Codeword[];
    toString(): string;
}

export { DetectionResultColumn };
