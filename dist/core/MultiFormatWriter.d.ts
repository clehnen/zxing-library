import { BitMatrix } from './common/BitMatrix.js';
import { Writer } from './Writer.js';
import { BarcodeFormat } from './BarcodeFormat.js';
import { EncodeHintType } from './EncodeHintType.js';
import './common/BitArray.js';
import '../customTypings.js';

/**
 * This is a factory class which finds the appropriate Writer subclass for the BarcodeFormat
 * requested and encodes the barcode with the supplied contents.
 *
 * @author dswitkin@google.com (Daniel Switkin)
 */
declare class MultiFormatWriter implements Writer {
    encode(contents: string, format: BarcodeFormat, width: number, height: number, hints: Map<EncodeHintType, any>): BitMatrix;
}

export { MultiFormatWriter };
