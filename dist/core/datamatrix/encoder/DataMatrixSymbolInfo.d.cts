import { Dimension } from '../../Dimension.cjs';
import { SymbolShapeHint } from './constants.cjs';

/**
 * Symbol info table for DataMatrix.
 */
declare class DataMatrixSymbolInfo {
    private readonly rectangular;
    private readonly dataCapacity;
    private readonly errorCodewords;
    readonly matrixWidth: number;
    readonly matrixHeight: number;
    private readonly dataRegions;
    private readonly rsBlockData;
    private readonly rsBlockError;
    constructor(rectangular: boolean, dataCapacity: number, errorCodewords: number, matrixWidth: number, matrixHeight: number, dataRegions: number, rsBlockData?: number, rsBlockError?: number);
    static lookup(dataCodewords: number, shape?: SymbolShapeHint, minSize?: Dimension, maxSize?: Dimension, fail?: boolean): DataMatrixSymbolInfo;
    private getHorizontalDataRegions;
    private getVerticalDataRegions;
    getSymbolDataWidth(): number;
    getSymbolDataHeight(): number;
    getSymbolWidth(): number;
    getSymbolHeight(): number;
    getCodewordCount(): number;
    getInterleavedBlockCount(): number;
    getDataCapacity(): number;
    getErrorCodewords(): number;
    getDataLengthForInterleavedBlock(index: number): number;
    getErrorLengthForInterleavedBlock(index: number): number;
}
declare const PROD_SYMBOLS: DataMatrixSymbolInfo[];

export { DataMatrixSymbolInfo, PROD_SYMBOLS };
