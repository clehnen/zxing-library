'use strict';

var BarcodeFormat = require('../BarcodeFormat');
var ChecksumException = require('../ChecksumException');
var FormatException = require('../FormatException');
var NotFoundException = require('../NotFoundException');
var Result = require('../Result');
var PDF417Common = require('./PDF417Common');
var ZXingInteger = require('../util/ZXingInteger');
var ResultMetadataType = require('../ResultMetadataType');
var Detector = require('./detector/Detector');
var PDF417ScanningDecoder = require('./decoder/PDF417ScanningDecoder');

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
      throw NotFoundException.NotFoundException.getNotFoundInstance();
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
      if (ignored instanceof FormatException.FormatException || ignored instanceof ChecksumException.ChecksumException) {
        throw NotFoundException.NotFoundException.getNotFoundInstance();
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
    const detectorResult = Detector.Detector.detectMultiple(image, hints, multiple);
    for (const points of detectorResult.getPoints()) {
      const decoderResult = PDF417ScanningDecoder.PDF417ScanningDecoder.decode(
        detectorResult.getBits(),
        points[4],
        points[5],
        points[6],
        points[7],
        PDF417Reader.getMinCodewordWidth(points),
        PDF417Reader.getMaxCodewordWidth(points)
      );
      const result = new Result.Result(decoderResult.getText(), decoderResult.getRawBytes(), void 0, points, BarcodeFormat.BarcodeFormat.PDF_417);
      result.putMetadata(ResultMetadataType.ResultMetadataType.ERROR_CORRECTION_LEVEL, decoderResult.getECLevel());
      const pdf417ResultMetadata = decoderResult.getOther();
      if (pdf417ResultMetadata != null) {
        result.putMetadata(ResultMetadataType.ResultMetadataType.PDF417_EXTRA_METADATA, pdf417ResultMetadata);
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
      return ZXingInteger.ZXingInteger.MAX_VALUE;
    }
    return Math.trunc(Math.abs(p1.getX() - p2.getX()));
  }
  static getMaxCodewordWidth(p) {
    return Math.floor(Math.max(
      Math.max(PDF417Reader.getMaxWidth(p[0], p[4]), PDF417Reader.getMaxWidth(p[6], p[2]) * PDF417Common.PDF417Common.MODULES_IN_CODEWORD / PDF417Common.PDF417Common.MODULES_IN_STOP_PATTERN),
      Math.max(PDF417Reader.getMaxWidth(p[1], p[5]), PDF417Reader.getMaxWidth(p[7], p[3]) * PDF417Common.PDF417Common.MODULES_IN_CODEWORD / PDF417Common.PDF417Common.MODULES_IN_STOP_PATTERN)
    ));
  }
  static getMinCodewordWidth(p) {
    return Math.floor(Math.min(
      Math.min(PDF417Reader.getMinWidth(p[0], p[4]), PDF417Reader.getMinWidth(p[6], p[2]) * PDF417Common.PDF417Common.MODULES_IN_CODEWORD / PDF417Common.PDF417Common.MODULES_IN_STOP_PATTERN),
      Math.min(PDF417Reader.getMinWidth(p[1], p[5]), PDF417Reader.getMinWidth(p[7], p[3]) * PDF417Common.PDF417Common.MODULES_IN_CODEWORD / PDF417Common.PDF417Common.MODULES_IN_STOP_PATTERN)
    ));
  }
  // @Override
  reset() {
  }
}

exports.PDF417Reader = PDF417Reader;
//# sourceMappingURL=PDF417Reader.cjs.map
//# sourceMappingURL=PDF417Reader.cjs.map