import { BrowserCodeReader } from './BrowserCodeReader.js';
import { MultiFormatReader } from '../core/MultiFormatReader.js';
import { BinaryBitmap } from '../core/BinaryBitmap.js';
import { Result } from '../core/Result.js';
import { DecodeHintType } from '../core/DecodeHintType.js';
import '../core/Reader.js';
import './DecodeContinuouslyCallback.js';
import '../core/Exception.js';
import 'ts-custom-error';
import './HTMLVisualMediaElement.js';
import './VideoInputDevice.js';
import '../core/Binarizer.js';
import '../core/LuminanceSource.js';
import '../core/common/BitArray.js';
import '../core/common/BitMatrix.js';
import '../customTypings.js';
import '../core/ResultPoint.js';
import '../core/BarcodeFormat.js';
import '../core/ResultMetadataType.js';

declare class BrowserMultiFormatReader extends BrowserCodeReader {
    protected readonly reader: MultiFormatReader;
    set hints(hints: Map<DecodeHintType, any>);
    constructor(hints?: Map<DecodeHintType, any>, timeBetweenScansMillis?: number);
    /**
     * Overwrite decodeBitmap to call decodeWithState, which will pay
     * attention to the hints set in the constructor function
     */
    decodeBitmap(binaryBitmap: BinaryBitmap): Result;
}

export { BrowserMultiFormatReader };
