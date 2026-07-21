import { QRCodeVersion } from './QRCodeVersion.cjs';
import '../../common/BitMatrix.cjs';
import '../../common/BitArray.cjs';
import '../../../customTypings.cjs';
import './QRCodeDecoderErrorCorrectionLevel.cjs';
import './ECBlocks.cjs';
import './ECB.cjs';

declare enum ModeValues {
    TERMINATOR = 0,// Not really a mode...
    NUMERIC = 1,
    ALPHANUMERIC = 2,
    STRUCTURED_APPEND = 3,// Not supported
    BYTE = 4,
    ECI = 5,// character counts don't apply
    KANJI = 6,
    FNC1_FIRST_POSITION = 7,
    FNC1_SECOND_POSITION = 8,
    /** See GBT 18284-2000; "Hanzi" is a transliteration of this mode name. */
    HANZI = 9
}
/**
 * <p>See ISO 18004:2006, 6.4.1, Tables 2 and 3. This enum encapsulates the various modes in which
 * data can be encoded to bits in the QR code standard.</p>
 *
 * @author Sean Owen
 */
declare class QRCodeMode {
    private value;
    private stringValue;
    private characterCountBitsForVersions;
    private bits;
    private static FOR_BITS;
    private static FOR_VALUE;
    static TERMINATOR: QRCodeMode;
    static NUMERIC: QRCodeMode;
    static ALPHANUMERIC: QRCodeMode;
    static STRUCTURED_APPEND: QRCodeMode;
    static BYTE: QRCodeMode;
    static ECI: QRCodeMode;
    static KANJI: QRCodeMode;
    static FNC1_FIRST_POSITION: QRCodeMode;
    static FNC1_SECOND_POSITION: QRCodeMode;
    /** See GBT 18284-2000; "Hanzi" is a transliteration of this mode name. */
    static HANZI: QRCodeMode;
    private constructor();
    /**
     * @param bits four bits encoding a QR Code data mode
     * @return Mode encoded by these bits
     * @throws IllegalArgumentException if bits do not correspond to a known mode
     */
    static forBits(bits: number): QRCodeMode;
    /**
     * @param version version in question
     * @return number of bits used, in this QR Code symbol {@link QRCodeVersion}, to encode the
     *         count of characters that will follow encoded in this Mode
     */
    getCharacterCountBits(version: QRCodeVersion): number;
    getValue(): ModeValues;
    getBits(): number;
    equals(o: any): boolean;
    toString(): string;
}

export { ModeValues, QRCodeMode };
