import { ResultPoint } from '../ResultPoint.cjs';
import { BitMatrix } from './BitMatrix.cjs';
import '../../customTypings.cjs';
import './BitArray.cjs';

/**
 * <p>Encapsulates the result of detecting a barcode in an image. This includes the raw
 * matrix of black/white pixels corresponding to the barcode, and possibly points of interest
 * in the image, like the location of finder patterns or corners of the barcode in the image.</p>
 *
 * @author Sean Owen
 */
declare class DetectorResult {
    private bits;
    private points;
    constructor(bits: BitMatrix, points: Array<ResultPoint>);
    getBits(): BitMatrix;
    getPoints(): Array<ResultPoint>;
}

export { DetectorResult };
