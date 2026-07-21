import { QRCodeDecoderErrorCorrectionLevel } from '../decoder/QRCodeDecoderErrorCorrectionLevel.cjs';
import { QRCodeMode } from '../decoder/QRCodeMode.cjs';
import { QRCodeVersion } from '../decoder/QRCodeVersion.cjs';
import { QRCodeByteMatrix } from './QRCodeByteMatrix.cjs';
import '../../common/BitMatrix.cjs';
import '../../common/BitArray.cjs';
import '../../../customTypings.cjs';
import '../decoder/ECBlocks.cjs';
import '../decoder/ECB.cjs';

/**
 * @author satorux@google.com (Satoru Takabayashi) - creator
 * @author dswitkin@google.com (Daniel Switkin) - ported from C++
 */
declare class QRCodeEncoderQRCode {
    static NUM_MASK_PATTERNS: number;
    private mode;
    private ecLevel;
    private version;
    private maskPattern;
    private matrix;
    constructor();
    getMode(): QRCodeMode;
    getECLevel(): QRCodeDecoderErrorCorrectionLevel;
    getVersion(): QRCodeVersion;
    getMaskPattern(): number;
    getMatrix(): QRCodeByteMatrix;
    toString(): string;
    setMode(value: QRCodeMode): void;
    setECLevel(value: QRCodeDecoderErrorCorrectionLevel): void;
    setVersion(version: QRCodeVersion): void;
    setMaskPattern(value: number): void;
    setMatrix(value: QRCodeByteMatrix): void;
    static isValidMaskPattern(maskPattern: number): boolean;
}

export { QRCodeEncoderQRCode };
