import { BitMatrix } from './common/BitMatrix.js';
import { BarcodeFormat } from './BarcodeFormat.js';
import { EncodeHintType } from './EncodeHintType.js';
import './common/BitArray.js';
import '../customTypings.js';

/**
 * The base class for all objects which encode/generate a barcode image.
 *
 * @author dswitkin@google.com (Daniel Switkin)
 */
interface Writer {
    /**
     * Encode a barcode using the default settings.
     *
     * @param contents The contents to encode in the barcode
     * @param format The barcode format to generate
     * @param width The preferred width in pixels
     * @param height The preferred height in pixels
     * @return {@link BitMatrix} representing encoded barcode image
     * @throws WriterException if contents cannot be encoded legally in a format
     */
    /**
     * @param contents The contents to encode in the barcode
     * @param format The barcode format to generate
     * @param width The preferred width in pixels
     * @param height The preferred height in pixels
     * @param hints Additional parameters to supply to the encoder
     * @return {@link BitMatrix} representing encoded barcode image
     * @throws WriterException if contents cannot be encoded legally in a format
     */
    encode(contents: string, format: BarcodeFormat, width: number, height: number, hints: Map<EncodeHintType, any>): BitMatrix;
}

export type { Writer };
