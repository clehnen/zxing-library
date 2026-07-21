import { BrowserCodeReader } from './BrowserCodeReader.js';
import { DecodeHintType } from '../core/DecodeHintType.js';
import '../core/BinaryBitmap.js';
import '../core/Binarizer.js';
import '../core/LuminanceSource.js';
import '../core/common/BitArray.js';
import '../core/common/BitMatrix.js';
import '../customTypings.js';
import '../core/Reader.js';
import '../core/Result.js';
import '../core/ResultPoint.js';
import '../core/BarcodeFormat.js';
import '../core/ResultMetadataType.js';
import './DecodeContinuouslyCallback.js';
import '../core/Exception.js';
import 'ts-custom-error';
import './HTMLVisualMediaElement.js';
import './VideoInputDevice.js';

/**
 * @deprecated Moving to @zxing/browser
 *
 * Barcode reader reader to use from browser.
 */
declare class BrowserBarcodeReader extends BrowserCodeReader {
    /**
     * Creates an instance of BrowserBarcodeReader.
     * @param {number} [timeBetweenScansMillis=500] the time delay between subsequent decode tries
     * @param {Map<DecodeHintType, any>} hints
     */
    constructor(timeBetweenScansMillis?: number, hints?: Map<DecodeHintType, any>);
}

export { BrowserBarcodeReader };
