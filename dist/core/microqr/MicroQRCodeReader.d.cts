import { Reader } from '../Reader.cjs';
import { Result } from '../Result.cjs';
import { BinaryBitmap } from '../BinaryBitmap.cjs';
import { DecodeHintType } from '../DecodeHintType.cjs';
import '../Binarizer.cjs';
import '../LuminanceSource.cjs';
import '../common/BitArray.cjs';
import '../common/BitMatrix.cjs';
import '../../customTypings.cjs';
import '../ResultPoint.cjs';
import '../BarcodeFormat.cjs';
import '../ResultMetadataType.cjs';

/**
 * Detects and decodes Micro QR Codes in images.
 */
declare class MicroQRCodeReader implements Reader {
    private readonly decoder;
    decode(image: BinaryBitmap, hints?: Map<DecodeHintType, any> | null): Result;
    reset(): void;
}

export { MicroQRCodeReader };
