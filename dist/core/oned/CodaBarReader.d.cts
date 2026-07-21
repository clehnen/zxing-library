import { BitArray } from '../common/BitArray.cjs';
import { DecodeHintType } from '../DecodeHintType.cjs';
import { OneDReader } from './OneDReader.cjs';
import { Result } from '../Result.cjs';
import '../BinaryBitmap.cjs';
import '../Binarizer.cjs';
import '../LuminanceSource.cjs';
import '../common/BitMatrix.cjs';
import '../../customTypings.cjs';
import '../Reader.cjs';
import '../ResultPoint.cjs';
import '../BarcodeFormat.cjs';
import '../ResultMetadataType.cjs';

/**
 * <p>Decodes CodaBar barcodes. </p>
 *
 * @author Evan @dodobelieve
 * @see CodaBarReader
 */
declare class CodaBarReader extends OneDReader {
    private readonly CODA_BAR_CHAR_SET;
    decodeRow(rowNumber: number, row: BitArray, hints?: Map<DecodeHintType, any>): Result;
    /**
     * converts bit array to valid data array(lengths of black bits and white bits)
     * @param row bit array to convert
     */
    private getValidRowData;
    /**
     * decode codabar code
     * @param row row to cecode
     */
    private codaBarDecodeRow;
    /**
     * check if the string is a CodaBar string
     * @param src string to determine
     */
    private validCodaBarString;
}

export { CodaBarReader };
