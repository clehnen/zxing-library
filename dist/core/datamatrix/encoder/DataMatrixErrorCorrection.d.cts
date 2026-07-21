import { DataMatrixSymbolInfo } from './DataMatrixSymbolInfo.cjs';
import '../../Dimension.cjs';
import './constants.cjs';

/**
 * Error Correction Code for ECC200.
 */
declare class DataMatrixErrorCorrection {
    /**
     * Creates the ECC200 error correction for an encoded message.
     *
     * @param codewords  the codewords
     * @param symbolInfo information about the symbol to be encoded
     * @return the codewords with interleaved error correction.
     */
    static encodeECC200(codewords: string, symbolInfo: DataMatrixSymbolInfo): string;
    private static createECCBlock;
}

export { DataMatrixErrorCorrection };
