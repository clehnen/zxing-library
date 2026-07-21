import { BitArray } from '../common/BitArray.js';
import { DecodeHintType } from '../DecodeHintType.js';
import { Result } from '../Result.js';
import { OneDReader } from './OneDReader.js';
import '../ResultPoint.js';
import '../../customTypings.js';
import '../BarcodeFormat.js';
import '../ResultMetadataType.js';
import '../BinaryBitmap.js';
import '../Binarizer.js';
import '../LuminanceSource.js';
import '../common/BitMatrix.js';
import '../Reader.js';

/**
 * @author Daniel Switkin <dswitkin@google.com>
 * @author Sean Owen
 */
declare class MultiFormatOneDReader extends OneDReader {
    private readers;
    constructor(hints?: Map<DecodeHintType, any>);
    decodeRow(rowNumber: number, row: BitArray, hints: Map<DecodeHintType, any>): Result;
    reset(): void;
}

export { MultiFormatOneDReader };
