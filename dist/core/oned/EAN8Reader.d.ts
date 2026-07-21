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
