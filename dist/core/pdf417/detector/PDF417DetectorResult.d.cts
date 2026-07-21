import { ResultPoint } from '../../ResultPoint.cjs';
import { BitMatrix } from '../../common/BitMatrix.cjs';
import '../../../customTypings.cjs';
import '../../common/BitArray.cjs';

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
