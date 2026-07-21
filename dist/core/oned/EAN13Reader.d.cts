import { BarcodeFormat } from '../BarcodeFormat.cjs';
import { BitArray } from '../common/BitArray.cjs';
import { UPCEANReader } from './UPCEANReader.cjs';
import '../DecodeHintType.cjs';
import '../Result.cjs';
import '../ResultPoint.cjs';
import '../../customTypings.cjs';
import '../ResultMetadataType.cjs';
import './AbstractUPCEANReader.cjs';
import './OneDReader.cjs';
import '../BinaryBitmap.cjs';
import '../Binarizer.cjs';
import '../LuminanceSource.cjs';
import '../common/BitMatrix.cjs';
import '../Reader.cjs';

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
