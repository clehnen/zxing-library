import { BitArray } from '../common/BitArray.js';
import { DecodeHintType } from '../DecodeHintType.js';
import { OneDReader } from './OneDReader.js';
import { Result } from '../Result.js';
import '../BinaryBitmap.js';
import '../Binarizer.js';
import '../LuminanceSource.js';
import '../common/BitMatrix.js';
import '../../customTypings.js';
import '../Reader.js';
import '../ResultPoint.js';
import '../BarcodeFormat.js';
import '../ResultMetadataType.js';

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
