import { BitMatrix } from '../../common/BitMatrix.cjs';
import '../../common/BitArray.cjs';
import '../../../customTypings.cjs';

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
