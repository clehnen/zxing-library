import { BitArray } from '../common/BitArray.js';
import { DecodeHintType } from '../DecodeHintType.js';
import { Result } from '../Result.js';
import { AbstractUPCEANReader } from './AbstractUPCEANReader.js';
import '../ResultPoint.js';
import '../../customTypings.js';
import '../BarcodeFormat.js';
import '../ResultMetadataType.js';
import './OneDReader.js';
import '../BinaryBitmap.js';
import '../Binarizer.js';
import '../LuminanceSource.js';
import '../common/BitMatrix.js';
import '../Reader.js';

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
