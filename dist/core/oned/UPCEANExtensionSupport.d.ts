import { BitArray } from '../common/BitArray.js';
import { Result } from '../Result.js';
import '../ResultPoint.js';
import '../../customTypings.js';
import '../BarcodeFormat.js';
import '../ResultMetadataType.js';

declare class UPCEANExtensionSupport {
    private static EXTENSION_START_PATTERN;
    static decodeRow(rowNumber: number, row: BitArray, rowOffset: number): Result;
}

export { UPCEANExtensionSupport };
