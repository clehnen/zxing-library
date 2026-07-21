import { BrowserCodeReader } from './BrowserCodeReader.js';
import '../core/BinaryBitmap.js';
import '../core/Binarizer.js';
import '../core/LuminanceSource.js';
import '../core/common/BitArray.js';
import '../core/common/BitMatrix.js';
import '../customTypings.js';
import '../core/DecodeHintType.js';
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
 * Aztec Code reader to use from browser.
 *
 * @class BrowserAztecCodeReader
 * @extends {BrowserCodeReader}
 */
declare class BrowserAztecCodeReader extends BrowserCodeReader {
    /**
     * Creates an instance of BrowserAztecCodeReader.
     * @param {number} [timeBetweenScansMillis=500] the time delay between subsequent decode tries
     *
     * @memberOf BrowserAztecCodeReader
     */
    constructor(timeBetweenScansMillis?: number);
}

export { BrowserAztecCodeReader };
