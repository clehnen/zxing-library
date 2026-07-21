import { BrowserCodeReader } from './BrowserCodeReader.cjs';
import { DecodeHintType } from '../core/DecodeHintType.cjs';
import '../core/BinaryBitmap.cjs';
import '../core/Binarizer.cjs';
import '../core/LuminanceSource.cjs';
import '../core/common/BitArray.cjs';
import '../core/common/BitMatrix.cjs';
import '../customTypings.cjs';
import '../core/Reader.cjs';
import '../core/Result.cjs';
import '../core/ResultPoint.cjs';
import '../core/BarcodeFormat.cjs';
import '../core/ResultMetadataType.cjs';
import './DecodeContinuouslyCallback.cjs';
import '../core/Exception.cjs';
import 'ts-custom-error';
import './HTMLVisualMediaElement.cjs';
import './VideoInputDevice.cjs';

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
