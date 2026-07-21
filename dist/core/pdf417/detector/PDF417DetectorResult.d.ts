import { ResultPoint } from '../../ResultPoint.js';
import { BitMatrix } from '../../common/BitMatrix.js';
import '../../../customTypings.js';
import '../../common/BitArray.js';

/**
 * @author Guenther Grau
 */
declare class PDF417DetectorResult {
    private bits;
    private points;
    constructor(bits: BitMatrix, points: ResultPoint[][]);
    getBits(): BitMatrix;
    getPoints(): ResultPoint[][];
}

export { PDF417DetectorResult };
