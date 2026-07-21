import { BoundingBox } from './BoundingBox.cjs';
import { BarcodeMetadata } from './BarcodeMetadata.cjs';
import { DetectionResultColumn } from './DetectionResultColumn.cjs';
import { int } from '../../../customTypings.cjs';
import '../../ResultPoint.cjs';
import '../../common/BitMatrix.cjs';
import '../../common/BitArray.cjs';
import './Codeword.cjs';

/**
 * @author Guenther Grau
 */
declare class DetectionResult {
    ADJUST_ROW_NUMBER_SKIP: int;
    private barcodeMetadata;
    private detectionResultColumns;
    private boundingBox;
    private barcodeColumnCount;
    constructor(barcodeMetadata: BarcodeMetadata, boundingBox: BoundingBox);
    getDetectionResultColumns(): DetectionResultColumn[];
    private adjustIndicatorColumnRowNumbers;
    /**
     * @return number of codewords which don't have a valid row number. Note that the count is not accurate as codewords
     * will be counted several times. It just serves as an indicator to see when we can stop adjusting row numbers
     */
    private adjustRowNumbersAndGetCount;
    private adjustRowNumbersByRow;
    private adjustRowNumbersFromBothRI;
    private adjustRowNumbersFromRRI;
    private adjustRowNumbersFromLRI;
    private static adjustRowNumberIfValid;
    private adjustRowNumbers;
    /**
     * @return true, if row number was adjusted, false otherwise
     */
    private static adjustRowNumber;
    getBarcodeColumnCount(): int;
    getBarcodeRowCount(): int;
    getBarcodeECLevel(): int;
    setBoundingBox(boundingBox: BoundingBox): void;
    getBoundingBox(): BoundingBox;
    setDetectionResultColumn(barcodeColumn: int, detectionResultColumn: DetectionResultColumn): void;
    getDetectionResultColumn(barcodeColumn: int): DetectionResultColumn;
    toString(): String;
}

export { DetectionResult };
