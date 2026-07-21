import { BitArray } from '../common/BitArray.cjs';
import { DecodeHintType } from '../DecodeHintType.cjs';
import { Result } from '../Result.cjs';
import { OneDReader } from './OneDReader.cjs';
import '../ResultPoint.cjs';
import '../../customTypings.cjs';
import '../BarcodeFormat.cjs';
import '../ResultMetadataType.cjs';
import '../BinaryBitmap.cjs';
import '../Binarizer.cjs';
import '../LuminanceSource.cjs';
import '../common/BitMatrix.cjs';
import '../Reader.cjs';

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
