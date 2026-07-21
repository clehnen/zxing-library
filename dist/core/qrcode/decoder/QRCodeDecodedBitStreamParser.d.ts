import { DecoderResult } from '../../common/DecoderResult.js';
import { DecodeHintType } from '../../DecodeHintType.js';
import { QRCodeDecoderErrorCorrectionLevel } from './QRCodeDecoderErrorCorrectionLevel.js';
import { QRCodeVersion } from './QRCodeVersion.js';
import '../../common/BitMatrix.js';
import '../../common/BitArray.js';
import '../../../customTypings.js';
import './ECBlocks.js';
import './ECB.js';

/**
 * <p>QR Codes can encode text as bits in one of several modes, and can use multiple modes
 * in one QR Code. This class decodes the bits back into text.</p>
 *
 * <p>See ISO 18004:2006, 6.4.3 - 6.4.7</p>
 *
 * @author Sean Owen
 */
declare class QRCodeDecodedBitStreamParser {
    /**
     * See ISO 18004:2006, 6.4.4 Table 5
     */
    private static ALPHANUMERIC_CHARS;
    private static GB2312_SUBSET;
    static decode(bytes: Uint8Array, version: QRCodeVersion, ecLevel: QRCodeDecoderErrorCorrectionLevel, hints: Map<DecodeHintType, any>): DecoderResult;
    /**
     * See specification GBT 18284-2000
     */
    private static decodeHanziSegment;
    private static decodeKanjiSegment;
    private static decodeByteSegment;
    private static toAlphaNumericChar;
    private static decodeAlphanumericSegment;
    private static decodeNumericSegment;
    private static parseECIValue;
}

export { QRCodeDecodedBitStreamParser };
