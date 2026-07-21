import { BitMatrix } from '../../common/BitMatrix.js';
import '../../common/BitArray.js';
import '../../../customTypings.js';

/**
 * @author mike32767
 * @author Manuel Kasten
 */
declare class BitMatrixParser {
    private static readonly BITNR;
    private bitMatrix;
    constructor(bitMatrix: BitMatrix);
    readCodewords(): Uint8Array;
}

export { BitMatrixParser };
