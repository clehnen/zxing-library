import { BarcodeFormat } from '../BarcodeFormat.js';
import { EncodeHintType } from '../EncodeHintType.js';
import { Writer } from '../Writer.js';
import { BitMatrix } from '../common/BitMatrix.js';
import { int } from '../../customTypings.js';
import '../common/BitArray.js';

/**
 * Renders an Aztec code as a {@link BitMatrix}.
 */
declare class AztecCodeWriter implements Writer {
    encode(contents: string, format: BarcodeFormat, width: int, height: int): BitMatrix;
    encodeWithHints(contents: string, format: BarcodeFormat, width: int, height: int, hints: Map<EncodeHintType, any>): BitMatrix;
    private static encodeLayers;
    private static renderResult;
}

export { AztecCodeWriter };
