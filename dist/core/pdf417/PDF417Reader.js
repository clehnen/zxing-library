import { BarcodeFormat } from '../BarcodeFormat';
import { ChecksumException } from '../ChecksumException';
import { FormatException } from '../FormatException';
import { NotFoundException } from '../NotFoundException';
import { Result } from '../Result';
import { PDF417Common } from './PDF417Common';
import { ZXingInteger } from '../util/ZXingInteger';
import { ResultMetadataType } from '../ResultMetadataType';
import { Detector } from './detector/Detector';
import { PDF417ScanningDecoder } from './decoder/PDF417ScanningDecoder';

class PDF417Reader {
  // private static /*final Result[]*/ EMPTY_RESULT_ARRAY: Result[] = new Result([0]);
  /**
   * Locates and decodes a PDF417 code in an image.
   *
   * @return a String representing the content encoded by the PDF417 code
   * @throws NotFoundException if a PDF417 code cannot be found,
   * @throws FormatException if a PDF417 cannot be decoded
   * @throws ChecksumException
   */
  // @Override
  decode(image, hints = null) {
    let result = PDF417Reader.decode(image, hints, false);
    if (result == null || result.length === 0 || result[0] == null) {
      throw NotFoundException.getNotFoundInstance();
    }
    return result[0];
  }
  /**
   *
   * @param BinaryBitmap
   * @param image
   * @throws NotFoundException
   */
  //   @Override
  decodeMultiple(image, hints = null) {
    try {
      return PDF417Reader.decode(image, hints, true);
    } catch (ignored) {
      if (ignored instanceof FormatException || ignored instanceof ChecksumException) {
        throw NotFoundException.getNotFoundInstance();
      }
      throw ignored;
    }
  }
  /**
   *
   * @param image
   * @param hints
   * @param multiple
   *
   * @throws NotFoundException
   * @throws FormatExceptionß
   * @throws ChecksumException
   */
  static decode(image, hints, multiple) {
    const results = new Array();
    const detectorResult = Detector.detectMultiple(image, hints, multiple);
    for (const points of detectorResult.getPoints()) {
      const decoderResult = PDF417ScanningDecoder.decode(
        detectorResult.getBits(),
        points[4],
        points[5],
        points[6],
        points[7],
        PDF417Reader.getMinCodewordWidth(points),
        PDF417Reader.getMaxCodewordWidth(points)
      );
      const result = new Result(decoderResult.getText(), decoderResult.getRawBytes(), void 0, points, BarcodeFormat.PDF_417);
      result.putMetadata(ResultMetadataType.ERROR_CORRECTION_LEVEL, decoderResult.getECLevel());
      const pdf417ResultMetadata = decoderResult.getOther();
      if (pdf417ResultMetadata != null) {
        result.putMetadata(ResultMetadataType.PDF417_EXTRA_METADATA, pdf417ResultMetadata);
      }
      results.push(result);
    }
    return results.map((x) => x);
  }
  static getMaxWidth(p1, p2) {
    if (p1 == null || p2 == null) {
      return 0;
    }
    return Math.trunc(Math.abs(p1.getX() - p2.getX()));
  }
  static getMinWidth(p1, p2) {
    if (p1 == null || p2 == null) {
      return ZXingInteger.MAX_VALUE;
    }
    return Math.trunc(Math.abs(p1.getX() - p2.getX()));
  }
  static getMaxCodewordWidth(p) {
    return Math.floor(Math.max(
      Math.max(PDF417Reader.getMaxWidth(p[0], p[4]), PDF417Reader.getMaxWidth(p[6], p[2]) * PDF417Common.MODULES_IN_CODEWORD / PDF417Common.MODULES_IN_STOP_PATTERN),
      Math.max(PDF417Reader.getMaxWidth(p[1], p[5]), PDF417Reader.getMaxWidth(p[7], p[3]) * PDF417Common.MODULES_IN_CODEWORD / PDF417Common.MODULES_IN_STOP_PATTERN)
    ));
  }
  static getMinCodewordWidth(p) {
    return Math.floor(Math.min(
      Math.min(PDF417Reader.getMinWidth(p[0], p[4]), PDF417Reader.getMinWidth(p[6], p[2]) * PDF417Common.MODULES_IN_CODEWORD / PDF417Common.MODULES_IN_STOP_PATTERN),
      Math.min(PDF417Reader.getMinWidth(p[1], p[5]), PDF417Reader.getMinWidth(p[7], p[3]) * PDF417Common.MODULES_IN_CODEWORD / PDF417Common.MODULES_IN_STOP_PATTERN)
    ));
  }
  // @Override
  reset() {
  }
}

export { PDF417Reader };
//# sourceMappingURL=PDF417Reader.js.map
//# sourceMappingURL=PDF417Reader.js.map