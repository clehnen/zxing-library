import { QRCodeDecoderErrorCorrectionLevel } from './QRCodeDecoderErrorCorrectionLevel';
import { ZXingInteger } from '../../util/ZXingInteger';

class QRCodeDecoderFormatInformation {
  static FORMAT_INFO_MASK_QR = 21522;
  /**
   * See ISO 18004:2006, Annex C, Table C.1
   */
  static FORMAT_INFO_DECODE_LOOKUP = [
    Int32Array.from([21522, 0]),
    Int32Array.from([20773, 1]),
    Int32Array.from([24188, 2]),
    Int32Array.from([23371, 3]),
    Int32Array.from([17913, 4]),
    Int32Array.from([16590, 5]),
    Int32Array.from([20375, 6]),
    Int32Array.from([19104, 7]),
    Int32Array.from([30660, 8]),
    Int32Array.from([29427, 9]),
    Int32Array.from([32170, 10]),
    Int32Array.from([30877, 11]),
    Int32Array.from([26159, 12]),
    Int32Array.from([25368, 13]),
    Int32Array.from([27713, 14]),
    Int32Array.from([26998, 15]),
    Int32Array.from([5769, 16]),
    Int32Array.from([5054, 17]),
    Int32Array.from([7399, 18]),
    Int32Array.from([6608, 19]),
    Int32Array.from([1890, 20]),
    Int32Array.from([597, 21]),
    Int32Array.from([3340, 22]),
    Int32Array.from([2107, 23]),
    Int32Array.from([13663, 24]),
    Int32Array.from([12392, 25]),
    Int32Array.from([16177, 26]),
    Int32Array.from([14854, 27]),
    Int32Array.from([9396, 28]),
    Int32Array.from([8579, 29]),
    Int32Array.from([11994, 30]),
    Int32Array.from([11245, 31])
  ];
  errorCorrectionLevel;
  dataMask;
  /*byte*/
  constructor(formatInfo) {
    this.errorCorrectionLevel = QRCodeDecoderErrorCorrectionLevel.forBits(formatInfo >> 3 & 3);
    this.dataMask = /*(byte) */
    formatInfo & 7;
  }
  static numBitsDiffering(a, b) {
    return ZXingInteger.bitCount(a ^ b);
  }
  /**
   * @param maskedFormatInfo1 format info indicator, with mask still applied
   * @param maskedFormatInfo2 second copy of same info; both are checked at the same time
   *  to establish best match
   * @return information about the format it specifies, or {@code null}
   *  if doesn't seem to match any known pattern
   */
  static decodeFormatInformation(maskedFormatInfo1, maskedFormatInfo2) {
    const formatInfo = QRCodeDecoderFormatInformation.doDecodeFormatInformation(maskedFormatInfo1, maskedFormatInfo2);
    if (formatInfo !== null) {
      return formatInfo;
    }
    return QRCodeDecoderFormatInformation.doDecodeFormatInformation(
      maskedFormatInfo1 ^ QRCodeDecoderFormatInformation.FORMAT_INFO_MASK_QR,
      maskedFormatInfo2 ^ QRCodeDecoderFormatInformation.FORMAT_INFO_MASK_QR
    );
  }
  static doDecodeFormatInformation(maskedFormatInfo1, maskedFormatInfo2) {
    let bestDifference = Number.MAX_SAFE_INTEGER;
    let bestFormatInfo = 0;
    for (const decodeInfo of QRCodeDecoderFormatInformation.FORMAT_INFO_DECODE_LOOKUP) {
      const targetInfo = decodeInfo[0];
      if (targetInfo === maskedFormatInfo1 || targetInfo === maskedFormatInfo2) {
        return new QRCodeDecoderFormatInformation(decodeInfo[1]);
      }
      let bitsDifference = QRCodeDecoderFormatInformation.numBitsDiffering(maskedFormatInfo1, targetInfo);
      if (bitsDifference < bestDifference) {
        bestFormatInfo = decodeInfo[1];
        bestDifference = bitsDifference;
      }
      if (maskedFormatInfo1 !== maskedFormatInfo2) {
        bitsDifference = QRCodeDecoderFormatInformation.numBitsDiffering(maskedFormatInfo2, targetInfo);
        if (bitsDifference < bestDifference) {
          bestFormatInfo = decodeInfo[1];
          bestDifference = bitsDifference;
        }
      }
    }
    if (bestDifference <= 3) {
      return new QRCodeDecoderFormatInformation(bestFormatInfo);
    }
    return null;
  }
  getErrorCorrectionLevel() {
    return this.errorCorrectionLevel;
  }
  getDataMask() {
    return this.dataMask;
  }
  /*@Override*/
  hashCode() {
    return this.errorCorrectionLevel.getBits() << 3 | this.dataMask;
  }
  /*@Override*/
  equals(o) {
    if (!(o instanceof QRCodeDecoderFormatInformation)) {
      return false;
    }
    const other = o;
    return this.errorCorrectionLevel === other.errorCorrectionLevel && this.dataMask === other.dataMask;
  }
}

export { QRCodeDecoderFormatInformation };
//# sourceMappingURL=QRCodeDecoderFormatInformation.js.map
//# sourceMappingURL=QRCodeDecoderFormatInformation.js.map