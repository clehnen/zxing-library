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
 * <p>A reader that can read all available UPC/EAN formats. If a caller wants to try to
 * read all such formats, it is most efficient to use this implementation rather than invoke
 * individual readers.</p>
 *
 * @author Sean Owen
 */
declare class MultiFormatUPCEANReader extends OneDReader {
    private readers;
    constructor(hints?: Map<DecodeHintType, any>);
    decodeRow(rowNumber: number, row: BitArray, hints?: Map<DecodeHintType, any>): Result;
    reset(): void;
}

export { MultiFormatUPCEANReader };
