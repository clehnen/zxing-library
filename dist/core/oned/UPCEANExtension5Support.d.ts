import { BitArray } from '../common/BitArray.js';
import { Result } from '../Result.js';
import { ResultMetadataType } from '../ResultMetadataType.js';
import '../ResultPoint.js';
import '../../customTypings.js';
import '../BarcodeFormat.js';

/**
 * @see UPCEANExtension2Support
 */
declare class UPCEANExtension5Support {
    private CHECK_DIGIT_ENCODINGS;
    private decodeMiddleCounters;
    private decodeRowStringBuffer;
    decodeRow(rowNumber: number, row: BitArray, extensionStartRange: Int32Array): Result;
    decodeMiddle(row: BitArray, startRange: Int32Array, resultString: string): number;
    static extensionChecksum(s: string): number;
    determineCheckDigit(lgPatternFound: number): number;
    static parseExtensionString(raw: string): Map<ResultMetadataType, string>;
    static parseExtension5String(raw: string): string;
}

export { UPCEANExtension5Support };
