import { BarcodeMetadata } from './BarcodeMetadata.js';
import { BoundingBox } from './BoundingBox.js';
import { DetectionResultColumn } from './DetectionResultColumn.js';
import '../../../customTypings.js';
import '../../ResultPoint.js';
import '../../common/BitMatrix.js';
import '../../common/BitArray.js';
import './Codeword.js';

/**
 * @author Guenther Grau
 */
declare class DetectionResultRowIndicatorColumn extends DetectionResultColumn {
    private _isLeft;
    constructor(boundingBox: BoundingBox, isLeft: boolean);
    private setRowNumbers;
    adjustCompleteIndicatorColumnRowNumbers(barcodeMetadata: BarcodeMetadata): void;
    getRowHeights(): Int32Array;
    private adjustIncompleteIndicatorColumnRowNumbers;
    getBarcodeMetadata(): BarcodeMetadata;
    private removeIncorrectCodewords;
    isLeft(): boolean;
    toString(): string;
}

export { DetectionResultRowIndicatorColumn };
