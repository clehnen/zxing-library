import { BarcodeFormat } from '../BarcodeFormat.js';
import { BitArray } from '../common/BitArray.js';
import { UPCEANReader } from './UPCEANReader.js';
import '../DecodeHintType.js';
import '../Result.js';
import '../ResultPoint.js';
import '../../customTypings.js';
import '../ResultMetadataType.js';
import './AbstractUPCEANReader.js';
import './OneDReader.js';
import '../BinaryBitmap.js';
import '../Binarizer.js';
import '../LuminanceSource.js';
import '../common/BitMatrix.js';
import '../Reader.js';

/**
 * <p>Implements decoding of the EAN-13 format.</p>
 *
 * @author dswitkin@google.com (Daniel Switkin)
 * @author Sean Owen
 * @author alasdair@google.com (Alasdair Mackintosh)
 */
declare class EAN13Reader extends UPCEANReader {
    private static FIRST_DIGIT_ENCODINGS;
    private decodeMiddleCounters;
    constructor();
    decodeMiddle(row: BitArray, startRange: Int32Array, resultString: string): {
        rowOffset: number;
        resultString: string;
    };
    getBarcodeFormat(): BarcodeFormat;
    static determineFirstDigit(resultString: string, lgPatternFound: number): string;
}

export { EAN13Reader };
