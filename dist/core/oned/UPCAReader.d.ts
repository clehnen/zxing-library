import { BarcodeFormat } from '../BarcodeFormat.js';
import { BinaryBitmap } from '../BinaryBitmap.js';
import { BitArray } from '../common/BitArray.js';
import { DecodeHintType } from '../DecodeHintType.js';
import { Result } from '../Result.js';
import { UPCEANReader } from './UPCEANReader.js';
import '../Binarizer.js';
import '../LuminanceSource.js';
import '../common/BitMatrix.js';
import '../../customTypings.js';
import '../ResultPoint.js';
import '../ResultMetadataType.js';
import './AbstractUPCEANReader.js';
import './OneDReader.js';
import '../Reader.js';

/**
 * Encapsulates functionality and implementation that is common to all families
 * of one-dimensional barcodes.
 *
 * @author dswitkin@google.com (Daniel Switkin)
 * @author Sean Owen
 * @author sam2332 (Sam Rudloff)
 *
 * @source https://github.com/zxing/zxing/blob/3c96923276dd5785d58eb970b6ba3f80d36a9505/core/src/main/java/com/google/zxing/oned/UPCAReader.java
 *
 * @experimental
 */
declare class UPCAReader extends UPCEANReader {
    private readonly ean13Reader;
    getBarcodeFormat(): BarcodeFormat;
    decode(image: BinaryBitmap, hints?: Map<DecodeHintType, any>): Result;
    decodeRow(rowNumber: number, row: BitArray, hints?: Map<DecodeHintType, any>): Result;
    decodeMiddle(row: BitArray, startRange: Int32Array, resultString: string): {
        rowOffset: number;
        resultString: string;
    };
    maybeReturnResult(result: Result): Result;
    reset(): void;
}

export { UPCAReader };
