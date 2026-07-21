import { BitArray } from '../../common/BitArray.js';
import { QRCodeDecoderErrorCorrectionLevel } from '../decoder/QRCodeDecoderErrorCorrectionLevel.js';
import { QRCodeVersion } from '../decoder/QRCodeVersion.js';
import { QRCodeByteMatrix } from './QRCodeByteMatrix.js';
import '../../common/BitMatrix.js';
import '../../../customTypings.js';
import '../decoder/ECBlocks.js';
import '../decoder/ECB.js';

/**
 * @author satorux@google.com (Satoru Takabayashi) - creator
 * @author dswitkin@google.com (Daniel Switkin) - ported from C++
 */
declare class QRCodeMatrixUtil {
    private constructor();
    private static POSITION_DETECTION_PATTERN;
    private static POSITION_ADJUSTMENT_PATTERN;
    private static POSITION_ADJUSTMENT_PATTERN_COORDINATE_TABLE;
    private static TYPE_INFO_COORDINATES;
    private static VERSION_INFO_POLY;
    private static TYPE_INFO_POLY;
    private static TYPE_INFO_MASK_PATTERN;
    static clearMatrix(matrix: QRCodeByteMatrix): void;
    static buildMatrix(dataBits: BitArray, ecLevel: QRCodeDecoderErrorCorrectionLevel, version: QRCodeVersion, maskPattern: number, matrix: QRCodeByteMatrix): void;
    static embedBasicPatterns(version: QRCodeVersion, matrix: QRCodeByteMatrix): void;
    static embedTypeInfo(ecLevel: QRCodeDecoderErrorCorrectionLevel, maskPattern: number, matrix: QRCodeByteMatrix): void;
    static maybeEmbedVersionInfo(version: QRCodeVersion, matrix: QRCodeByteMatrix): void;
    static embedDataBits(dataBits: BitArray, maskPattern: number, matrix: QRCodeByteMatrix): void;
    static findMSBSet(value: number): number;
    static calculateBCHCode(value: number, poly: number): number;
    static makeTypeInfoBits(ecLevel: QRCodeDecoderErrorCorrectionLevel, maskPattern: number, bits: BitArray): void;
    static makeVersionInfoBits(version: QRCodeVersion, bits: BitArray): void;
    private static isEmpty;
    private static embedTimingPatterns;
    private static embedDarkDotAtLeftBottomCorner;
    private static embedHorizontalSeparationPattern;
    private static embedVerticalSeparationPattern;
    private static embedPositionAdjustmentPattern;
    private static embedPositionDetectionPattern;
    private static embedPositionDetectionPatternsAndSeparators;
    private static maybeEmbedPositionAdjustmentPatterns;
}

export { QRCodeMatrixUtil };
