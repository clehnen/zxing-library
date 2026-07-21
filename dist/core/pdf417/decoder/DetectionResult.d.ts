import { BoundingBox } from './BoundingBox.js';
import { BarcodeMetadata } from './BarcodeMetadata.js';
import { DetectionResultColumn } from './DetectionResultColumn.js';
import { int } from '../../../customTypings.js';
import '../../ResultPoint.js';
import '../../common/BitMatrix.js';
import '../../common/BitArray.js';
import './Codeword.js';

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
