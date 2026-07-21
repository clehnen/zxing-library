import { BitArray } from '../common/BitArray.cjs';
import { Result } from '../Result.cjs';
import '../ResultPoint.cjs';
import '../../customTypings.cjs';
import '../BarcodeFormat.cjs';
import '../ResultMetadataType.cjs';

declare class UPCEANExtensionSupport {
    private static EXTENSION_START_PATTERN;
    static decodeRow(rowNumber: number, row: BitArray, rowOffset: number): Result;
}

export { UPCEANExtensionSupport };
