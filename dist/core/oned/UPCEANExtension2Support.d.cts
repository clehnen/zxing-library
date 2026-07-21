import { BitArray } from '../common/BitArray.cjs';
import { Result } from '../Result.cjs';
import { ResultMetadataType } from '../ResultMetadataType.cjs';
import '../ResultPoint.cjs';
import '../../customTypings.cjs';
import '../BarcodeFormat.cjs';

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
