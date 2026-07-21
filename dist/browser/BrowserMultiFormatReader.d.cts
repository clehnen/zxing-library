import { BrowserCodeReader } from './BrowserCodeReader.cjs';
import { MultiFormatReader } from '../core/MultiFormatReader.cjs';
import { BinaryBitmap } from '../core/BinaryBitmap.cjs';
import { Result } from '../core/Result.cjs';
import { DecodeHintType } from '../core/DecodeHintType.cjs';
import '../core/Reader.cjs';
import './DecodeContinuouslyCallback.cjs';
import '../core/Exception.cjs';
import 'ts-custom-error';
import './HTMLVisualMediaElement.cjs';
import './VideoInputDevice.cjs';
import '../core/Binarizer.cjs';
import '../core/LuminanceSource.cjs';
import '../core/common/BitArray.cjs';
import '../core/common/BitMatrix.cjs';
import '../customTypings.cjs';
import '../core/ResultPoint.cjs';
import '../core/BarcodeFormat.cjs';
import '../core/ResultMetadataType.cjs';

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
