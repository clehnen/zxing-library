declare enum ErrorCorrectionLevelValues {
    L = 0,
    M = 1,
    Q = 2,
    H = 3
}
/**
 * <p>See ISO 18004:2006, 6.5.1. This enum encapsulates the four error correction levels
 * defined by the QR code standard.</p>
 *
 * @author Sean Owen
 */
declare class QRCodeDecoderErrorCorrectionLevel {
    private value;
    private stringValue;
    private bits;
    private static FOR_BITS;
    private static FOR_VALUE;
    /** L = ~7% correction */
    static L: QRCodeDecoderErrorCorrectionLevel;
    /** M = ~15% correction */
    static M: QRCodeDecoderErrorCorrectionLevel;
    /** Q = ~25% correction */
    static Q: QRCodeDecoderErrorCorrectionLevel;
    /** H = ~30% correction */
    static H: QRCodeDecoderErrorCorrectionLevel;
    private constructor();
    getValue(): ErrorCorrectionLevelValues;
    getBits(): number;
    static fromString(s: string): QRCodeDecoderErrorCorrectionLevel;
    toString(): string;
    equals(o: any): boolean;
    /**
     * @param bits int containing the two bits encoding a QR Code's error correction level
     * @return ErrorCorrectionLevel representing the encoded error correction level
     */
    static forBits(bits: number): QRCodeDecoderErrorCorrectionLevel;
}

export { ErrorCorrectionLevelValues, QRCodeDecoderErrorCorrectionLevel };
