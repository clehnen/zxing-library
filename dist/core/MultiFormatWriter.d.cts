import { BitMatrix } from './common/BitMatrix.cjs';
import { Writer } from './Writer.cjs';
import { BarcodeFormat } from './BarcodeFormat.cjs';
import { EncodeHintType } from './EncodeHintType.cjs';
import './common/BitArray.cjs';
import '../customTypings.cjs';

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
