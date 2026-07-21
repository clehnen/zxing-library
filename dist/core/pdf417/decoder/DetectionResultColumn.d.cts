import { Codeword } from './Codeword.cjs';
import { BoundingBox } from './BoundingBox.cjs';
import { int } from '../../../customTypings.cjs';
import '../../ResultPoint.cjs';
import '../../common/BitMatrix.cjs';
import '../../common/BitArray.cjs';

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
