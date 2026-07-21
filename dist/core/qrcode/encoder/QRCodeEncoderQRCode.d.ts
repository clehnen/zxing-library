import { QRCodeDecoderErrorCorrectionLevel } from '../decoder/QRCodeDecoderErrorCorrectionLevel.js';
import { QRCodeMode } from '../decoder/QRCodeMode.js';
import { QRCodeVersion } from '../decoder/QRCodeVersion.js';
import { QRCodeByteMatrix } from './QRCodeByteMatrix.js';
import '../../common/BitMatrix.js';
import '../../common/BitArray.js';
import '../../../customTypings.js';
import '../decoder/ECBlocks.js';
import '../decoder/ECB.js';

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
