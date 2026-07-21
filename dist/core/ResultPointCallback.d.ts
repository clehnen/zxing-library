import { ResultPoint } from './ResultPoint.js';
import '../customTypings.js';

/**
 * Callback which is invoked when a possible result point (significant
 * point in the barcode image such as a corner) is found.
 *
 * @see DecodeHintType#NEED_RESULT_POINT_CALLBACK
 */
interface ResultPointCallback {
    foundPossibleResultPoint(point: ResultPoint): void;
}

export type { ResultPointCallback };
