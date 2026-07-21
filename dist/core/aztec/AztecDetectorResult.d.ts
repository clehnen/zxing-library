import { ResultPoint } from '../ResultPoint.js';
import { BitMatrix } from '../common/BitMatrix.js';
import { DetectorResult } from '../common/DetectorResult.js';
import '../../customTypings.js';
import '../common/BitArray.js';

/**
 * <p>Extends {@link DetectorResult} with more information specific to the Aztec format,
 * like the number of layers and whether it's compact.</p>
 *
 * @author Sean Owen
 */
declare class AztecDetectorResult extends DetectorResult {
    private compact;
    private nbDatablocks;
    private nbLayers;
    constructor(bits: BitMatrix, points: ResultPoint[], compact: boolean, nbDatablocks: number, nbLayers: number);
    getNbLayers(): number;
    getNbDatablocks(): number;
    isCompact(): boolean;
}

export { AztecDetectorResult };
