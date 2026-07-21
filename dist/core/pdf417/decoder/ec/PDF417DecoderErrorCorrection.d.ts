import { int } from '../../../../customTypings.js';

/**
 * <p>PDF417 error correction implementation.</p>
 *
 * <p>This <a href="http://en.wikipedia.org/wiki/Reed%E2%80%93Solomon_error_correction#Example">example</a>
 * is quite useful in understanding the algorithm.</p>
 *
 * @author Sean Owen
 * @see com.google.zxing.common.reedsolomon.ReedSolomonDecoder
 */
declare class PDF417DecoderErrorCorrection {
    private field;
    constructor();
    /**
     * @param received received codewords
     * @param numECCodewords number of those codewords used for EC
     * @param erasures location of erasures
     * @return number of errors
     * @throws ChecksumException if errors cannot be corrected, maybe because of too many errors
     */
    decode(received: Int32Array, numECCodewords: int, erasures: Int32Array): int;
    /**
     *
     * @param ModulusPoly
     * @param a
     * @param ModulusPoly
     * @param b
     * @param int
     * @param R
     * @throws ChecksumException
     */
    private runEuclideanAlgorithm;
    /**
     *
     * @param errorLocator
     * @throws ChecksumException
     */
    private findErrorLocations;
    private findErrorMagnitudes;
}

export { PDF417DecoderErrorCorrection };
