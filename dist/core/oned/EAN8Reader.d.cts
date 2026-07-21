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
 * <p>Implements decoding of the EAN-8 format.</p>
 *
 * @author Sean Owen
 */
declare class EAN8Reader extends UPCEANReader {
    private decodeMiddleCounters;
    constructor();
    decodeMiddle(row: BitArray, startRange: Int32Array, resultString: string): {
        rowOffset: number;
        resultString: string;
    };
    getBarcodeFormat(): BarcodeFormat;
}

export { EAN8Reader };
