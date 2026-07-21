import { BarcodeFormat } from '../BarcodeFormat.cjs';
import { BinaryBitmap } from '../BinaryBitmap.cjs';
import { BitArray } from '../common/BitArray.cjs';
import { DecodeHintType } from '../DecodeHintType.cjs';
import { Result } from '../Result.cjs';
import { UPCEANReader } from './UPCEANReader.cjs';
import '../Binarizer.cjs';
import '../LuminanceSource.cjs';
import '../common/BitMatrix.cjs';
import '../../customTypings.cjs';
import '../ResultPoint.cjs';
import '../ResultMetadataType.cjs';
import './AbstractUPCEANReader.cjs';
import './OneDReader.cjs';
import '../Reader.cjs';

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
