import { Reader } from '../Reader.js';
import { Result } from '../Result.js';
import { BinaryBitmap } from '../BinaryBitmap.js';
import { DecodeHintType } from '../DecodeHintType.js';
import '../Binarizer.js';
import '../LuminanceSource.js';
import '../common/BitArray.js';
import '../common/BitMatrix.js';
import '../../customTypings.js';
import '../ResultPoint.js';
import '../BarcodeFormat.js';
import '../ResultMetadataType.js';

/**
 * Detects and decodes Micro QR Codes in images.
 */
declare class MicroQRCodeReader implements Reader {
    private readonly decoder;
    decode(image: BinaryBitmap, hints?: Map<DecodeHintType, any> | null): Result;
    reset(): void;
}

export { MicroQRCodeReader };
