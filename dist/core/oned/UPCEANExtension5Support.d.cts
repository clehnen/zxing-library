import { BitArray } from '../common/BitArray.cjs';
import { Result } from '../Result.cjs';
import { ResultMetadataType } from '../ResultMetadataType.cjs';
import '../ResultPoint.cjs';
import '../../customTypings.cjs';
import '../BarcodeFormat.cjs';

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
