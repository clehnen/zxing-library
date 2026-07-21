'use strict';

var BarcodeFormat = require('../BarcodeFormat');
var BitMatrix = require('../common/BitMatrix');
var DecodeHintType = require('../DecodeHintType');
var NotFoundException = require('../NotFoundException');
var Result = require('../Result');
var ResultMetadataType = require('../ResultMetadataType');
var Decoder = require('./decoder/Decoder');
var QRCodeDecoderMetaData = require('./decoder/QRCodeDecoderMetaData');
var Detector = require('./detector/Detector');

class QRCodeReader {
  static NO_POINTS = new Array();
  decoder = new Decoder.Decoder();
  getDecoder() {
    return this.decoder;
  }
  /**
   * Locates and decodes a QR code in an image.
   *
   * @return a representing: string the content encoded by the QR code
   * @throws NotFoundException if a QR code cannot be found
   * @throws FormatException if a QR code cannot be decoded
   * @throws ChecksumException if error correction fails
   */
  /*@Override*/
  // public decode(image: BinaryBitmap): Result /*throws NotFoundException, ChecksumException, FormatException */ {
  //   return this.decode(image, null)
  // }
  /*@Override*/
  decode(image, hints) {
    let decoderResult;
    let points;
    if (hints !== void 0 && hints !== null && void 0 !== hints.get(DecodeHintType.DecodeHintType.PURE_BARCODE)) {
      const bits = QRCodeReader.extractPureBits(image.getBlackMatrix());
      decoderResult = this.decoder.decodeBitMatrix(bits, hints);
      points = QRCodeReader.NO_POINTS;
    } else {
      const detectorResult = new Detector.Detector(image.getBlackMatrix()).detect(hints);
      decoderResult = this.decoder.decodeBitMatrix(detectorResult.getBits(), hints);
      points = detectorResult.getPoints();
    }
    if (decoderResult.getOther() instanceof QRCodeDecoderMetaData.QRCodeDecoderMetaData) {
      decoderResult.getOther().applyMirroredCorrection(points);
    }
    const result = new Result.Result(decoderResult.getText(), decoderResult.getRawBytes(), void 0, points, BarcodeFormat.BarcodeFormat.QR_CODE, void 0);
    const byteSegments = decoderResult.getByteSegments();
    if (byteSegments !== null) {
      result.putMetadata(ResultMetadataType.ResultMetadataType.BYTE_SEGMENTS, byteSegments);
    }
    const ecLevel = decoderResult.getECLevel();
    if (ecLevel !== null) {
      result.putMetadata(ResultMetadataType.ResultMetadataType.ERROR_CORRECTION_LEVEL, ecLevel);
    }
    if (decoderResult.hasStructuredAppend()) {
      result.putMetadata(
        ResultMetadataType.ResultMetadataType.STRUCTURED_APPEND_SEQUENCE,
        decoderResult.getStructuredAppendSequenceNumber()
      );
      result.putMetadata(
        ResultMetadataType.ResultMetadataType.STRUCTURED_APPEND_PARITY,
        decoderResult.getStructuredAppendParity()
      );
    }
    return result;
  }
  /*@Override*/
  reset() {
  }
  /**
   * This method detects a code in a "pure" image -- that is, pure monochrome image
   * which contains only an unrotated, unskewed, image of a code, with some white border
   * around it. This is a specialized method that works exceptionally fast in this special
   * case.
   *
   * @see com.google.zxing.datamatrix.DataMatrixReader#extractPureBits(BitMatrix)
   */
  static extractPureBits(image) {
    const leftTopBlack = image.getTopLeftOnBit();
    const rightBottomBlack = image.getBottomRightOnBit();
    if (leftTopBlack === null || rightBottomBlack === null) {
      throw new NotFoundException.NotFoundException();
    }
    const moduleSize = this.moduleSize(leftTopBlack, image);
    let top = leftTopBlack[1];
    let bottom = rightBottomBlack[1];
    let left = leftTopBlack[0];
    let right = rightBottomBlack[0];
    if (left >= right || top >= bottom) {
      throw new NotFoundException.NotFoundException();
    }
    if (bottom - top !== right - left) {
      right = left + (bottom - top);
      if (right >= image.getWidth()) {
        throw new NotFoundException.NotFoundException();
      }
    }
    const matrixWidth = Math.round((right - left + 1) / moduleSize);
    const matrixHeight = Math.round((bottom - top + 1) / moduleSize);
    if (matrixWidth <= 0 || matrixHeight <= 0) {
      throw new NotFoundException.NotFoundException();
    }
    if (matrixHeight !== matrixWidth) {
      throw new NotFoundException.NotFoundException();
    }
    const nudge = (
      /*(int) */
      Math.floor(moduleSize / 2)
    );
    top += nudge;
    left += nudge;
    const nudgedTooFarRight = left + /*(int) */
    Math.floor((matrixWidth - 1) * moduleSize) - right;
    if (nudgedTooFarRight > 0) {
      if (nudgedTooFarRight > nudge) {
        throw new NotFoundException.NotFoundException();
      }
      left -= nudgedTooFarRight;
    }
    const nudgedTooFarDown = top + /*(int) */
    Math.floor((matrixHeight - 1) * moduleSize) - bottom;
    if (nudgedTooFarDown > 0) {
      if (nudgedTooFarDown > nudge) {
        throw new NotFoundException.NotFoundException();
      }
      top -= nudgedTooFarDown;
    }
    const bits = new BitMatrix.BitMatrix(matrixWidth, matrixHeight);
    for (let y = 0; y < matrixHeight; y++) {
      const iOffset = top + /*(int) */
      Math.floor(y * moduleSize);
      for (let x = 0; x < matrixWidth; x++) {
        if (image.get(left + /*(int) */
        Math.floor(x * moduleSize), iOffset)) {
          bits.set(x, y);
        }
      }
    }
    return bits;
  }
  static moduleSize(leftTopBlack, image) {
    const height = image.getHeight();
    const width = image.getWidth();
    let x = leftTopBlack[0];
    let y = leftTopBlack[1];
    let inBlack = true;
    let transitions = 0;
    while (x < width && y < height) {
      if (inBlack !== image.get(x, y)) {
        if (++transitions === 5) {
          break;
        }
        inBlack = !inBlack;
      }
      x++;
      y++;
    }
    if (x === width || y === height) {
      throw new NotFoundException.NotFoundException();
    }
    return (x - leftTopBlack[0]) / 7;
  }
}

exports.QRCodeReader = QRCodeReader;
//# sourceMappingURL=QRCodeReader.cjs.map
//# sourceMappingURL=QRCodeReader.cjs.map