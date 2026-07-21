import { BarcodeFormat } from '../BarcodeFormat.cjs';
import { EncodeHintType } from '../EncodeHintType.cjs';
import { Writer } from '../Writer.cjs';
import { BitMatrix } from '../common/BitMatrix.cjs';
import { int } from '../../customTypings.cjs';
import '../common/BitArray.cjs';

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
