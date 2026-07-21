import { BitArray } from '../common/BitArray.cjs';
import { DecodeHintType } from '../DecodeHintType.cjs';
import { Result } from '../Result.cjs';
import { AbstractUPCEANReader } from './AbstractUPCEANReader.cjs';
import '../ResultPoint.cjs';
import '../../customTypings.cjs';
import '../BarcodeFormat.cjs';
import '../ResultMetadataType.cjs';
import './OneDReader.cjs';
import '../BinaryBitmap.cjs';
import '../Binarizer.cjs';
import '../LuminanceSource.cjs';
import '../common/BitMatrix.cjs';
import '../Reader.cjs';

/**
 * <p>Encapsulates functionality and implementation that is common to UPC and EAN families
 * of one-dimensional barcodes.</p>
 *
 * @author dswitkin@google.com (Daniel Switkin)
 * @author Sean Owen
 * @author alasdair@google.com (Alasdair Mackintosh)
 */
declare abstract class UPCEANReader extends AbstractUPCEANReader {
    constructor();
    decodeRow(rowNumber: number, row: BitArray, hints?: Map<DecodeHintType, any>): Result;
    static checkChecksum(s: string): boolean;
    static checkStandardUPCEANChecksum(s: string): boolean;
    static getStandardUPCEANChecksum(s: string): number;
    static decodeEnd(row: BitArray, endStart: number): Int32Array;
}

export { UPCEANReader };
