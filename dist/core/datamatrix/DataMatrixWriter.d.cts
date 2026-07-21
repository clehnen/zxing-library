import { BarcodeFormat } from '../BarcodeFormat.cjs';
import { BitMatrix } from '../common/BitMatrix.cjs';
import { EncodeHintType } from '../EncodeHintType.cjs';
import { Writer } from '../Writer.cjs';
import '../common/BitArray.cjs';
import '../../customTypings.cjs';

declare class DataMatrixWriter implements Writer {
    encode(contents: string, format: BarcodeFormat, width: number, height: number, hints?: Map<EncodeHintType, unknown>): BitMatrix;
    /**
     * Encode the given symbol info to a bit matrix.
     *
     * @param placement  The DataMatrix placement.
     * @param symbolInfo The symbol info to encode.
     * @return The bit matrix generated.
     */
    private encodeLowLevel;
    /**
     * Convert the ByteMatrix to BitMatrix.
     *
     * @param reqHeight The requested height of the image (in pixels) with the Datamatrix code
     * @param reqWidth The requested width of the image (in pixels) with the Datamatrix code
     * @param matrix The input matrix.
     * @return The output matrix.
     */
    private convertByteMatrixToBitMatrix;
}

export { DataMatrixWriter };
