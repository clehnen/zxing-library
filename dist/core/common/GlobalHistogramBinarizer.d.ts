import { Binarizer } from '../Binarizer.js';
import { LuminanceSource } from '../LuminanceSource.js';
import { BitArray } from './BitArray.js';
import { BitMatrix } from './BitMatrix.js';
import '../../customTypings.js';

/**
 * This Binarizer implementation uses the old ZXing global histogram approach. It is suitable
 * for low-end mobile devices which don't have enough CPU or memory to use a local thresholding
 * algorithm. However, because it picks a global black point, it cannot handle difficult shadows
 * and gradients.
 *
 * Faster mobile devices and all desktop applications should probably use HybridBinarizer instead.
 *
 * @author dswitkin@google.com (Daniel Switkin)
 * @author Sean Owen
 */
declare class GlobalHistogramBinarizer extends Binarizer {
    private static LUMINANCE_BITS;
    private static LUMINANCE_SHIFT;
    private static LUMINANCE_BUCKETS;
    private static EMPTY;
    private luminances;
    private buckets;
    constructor(source: LuminanceSource);
    getBlackRow(y: number, row: BitArray): BitArray;
    getBlackMatrix(): BitMatrix;
    createBinarizer(source: LuminanceSource): Binarizer;
    private initArrays;
    private static estimateBlackPoint;
}

export { GlobalHistogramBinarizer };
