import { BarcodeMetadata } from './BarcodeMetadata.cjs';
import { BoundingBox } from './BoundingBox.cjs';
import { DetectionResultColumn } from './DetectionResultColumn.cjs';
import '../../../customTypings.cjs';
import '../../ResultPoint.cjs';
import '../../common/BitMatrix.cjs';
import '../../common/BitArray.cjs';
import './Codeword.cjs';

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
