import { BitArray } from '../common/BitArray.js';
import { Result } from '../Result.js';
import { ResultMetadataType } from '../ResultMetadataType.js';
import '../ResultPoint.js';
import '../../customTypings.js';
import '../BarcodeFormat.js';

/**
 * @see UPCEANExtension5Support
 */
declare class UPCEANExtension2Support {
    private decodeMiddleCounters;
    private decodeRowStringBuffer;
    decodeRow(rowNumber: number, row: BitArray, extensionStartRange: Int32Array): Result;
    decodeMiddle(row: BitArray, startRange: Int32Array, resultString: string): number;
    static parseExtensionString(raw: string): Map<ResultMetadataType, number>;
}

export { UPCEANExtension2Support };
