import { int } from '../../../customTypings.js';

/**
 * @author Guenther Grau
 */
declare class BarcodeMetadata {
    private columnCount;
    private errorCorrectionLevel;
    private rowCountUpperPart;
    private rowCountLowerPart;
    private rowCount;
    constructor(columnCount: int, rowCountUpperPart: int, rowCountLowerPart: int, errorCorrectionLevel: int);
    getColumnCount(): int;
    getErrorCorrectionLevel(): int;
    getRowCount(): int;
    getRowCountUpperPart(): int;
    getRowCountLowerPart(): int;
}

export { BarcodeMetadata };
