import { BitMatrix } from '../../common/BitMatrix.js';
import { QRCodeDecoderErrorCorrectionLevel } from './QRCodeDecoderErrorCorrectionLevel.js';
import { ECBlocks } from './ECBlocks.js';
import '../../common/BitArray.js';
import '../../../customTypings.js';
import './ECB.js';

/**
 * See ISO 18004:2006 Annex D
 *
 * @author Sean Owen
 */
declare class QRCodeVersion {
    private versionNumber;
    private alignmentPatternCenters;
    /**
       * See ISO 18004:2006 Annex D.
       * Element i represents the raw version bits that specify version i + 7
       */
    private static VERSION_DECODE_INFO;
    /**
       * See ISO 18004:2006 6.5.1 Table 9
       */
    private static VERSIONS;
    private ecBlocks;
    private totalCodewords;
    private constructor();
    getVersionNumber(): number;
    getAlignmentPatternCenters(): Int32Array;
    getTotalCodewords(): number;
    getDimensionForVersion(): number;
    getECBlocksForLevel(ecLevel: QRCodeDecoderErrorCorrectionLevel): ECBlocks;
    /**
     * <p>Deduces version information purely from QR Code dimensions.</p>
     *
     * @param dimension dimension in modules
     * @return Version for a QR Code of that dimension
     * @throws FormatException if dimension is not 1 mod 4
     */
    static getProvisionalVersionForDimension(dimension: number): QRCodeVersion;
    static getVersionForNumber(versionNumber: number): QRCodeVersion;
    static decodeVersionInformation(versionBits: number): QRCodeVersion;
    /**
     * See ISO 18004:2006 Annex E
     */
    buildFunctionPattern(): BitMatrix;
    toString(): string;
}

export { QRCodeVersion };
