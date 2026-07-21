import { BarcodeFormat } from '../BarcodeFormat.js';
import { EncodeHintType } from '../EncodeHintType.js';
import { Writer } from '../Writer.js';
import { BitMatrix } from '../common/BitMatrix.js';
import '../common/BitArray.js';
import '../../customTypings.js';

/**
 * This object renders a QR Code as a BitMatrix 2D array of greyscale values.
 *
 * @author dswitkin@google.com (Daniel Switkin)
 */
declare class QRCodeWriter implements Writer {
    private static QUIET_ZONE_SIZE;
    encode(contents: string, format: BarcodeFormat, width: number, height: number, hints: Map<EncodeHintType, any>): BitMatrix;
    private static renderResult;
}

export { QRCodeWriter };
