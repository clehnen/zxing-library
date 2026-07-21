import { BarcodeFormat } from '../BarcodeFormat.cjs';
import { EncodeHintType } from '../EncodeHintType.cjs';
import { Writer } from '../Writer.cjs';
import { BitMatrix } from '../common/BitMatrix.cjs';
import '../common/BitArray.cjs';
import '../../customTypings.cjs';

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
