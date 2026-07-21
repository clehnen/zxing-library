'use strict';

var BarcodeFormat = require('../BarcodeFormat');
var BitMatrix = require('../common/BitMatrix');
var DecodeHintType = require('../DecodeHintType');
var NotFoundException = require('../NotFoundException');
var Result = require('../Result');
var ResultMetadataType = require('../ResultMetadataType');
var ZXingSystem = require('../util/ZXingSystem');
var Decoder = require('./decoder/Decoder');
var Detector = require('./detector/Detector');

class DataMatrixReader {
  static NO_POINTS = [];
  decoder = new Decoder.Decoder();
  /**
   * Locates and decodes a Data Matrix code in an image.
   *
   * @return a String representing the content encoded by the Data Matrix code
   * @throws NotFoundException if a Data Matrix code cannot be found
   * @throws FormatException if a Data Matrix code cannot be decoded
   * @throws ChecksumException if error correction fails
   */
  // @Override
  // public Result decode(BinaryBitmap image) throws NotFoundException, ChecksumException, FormatException {
  //   return decode(image, null);
  // }
  // @Override
  decode(image, hints = null) {
    let decoderResult;
    let points;
    if (hints != null && hints.has(DecodeHintType.DecodeHintType.PURE_BARCODE)) {
      const bits = DataMatrixReader.extractPureBits(image.getBlackMatrix());
      decoderResult = this.decoder.decode(bits);
      points = DataMatrixReader.NO_POINTS;
    } else {
      const detectorResult = new Detector.Detector(image.getBlackMatrix()).detect();
      decoderResult = this.decoder.decode(detectorResult.getBits());
      points = detectorResult.getPoints();
    }
    const rawBytes = decoderResult.getRawBytes();
    const result = new Result.Result(
      decoderResult.getText(),
      rawBytes,
      8 * rawBytes.length,
      points,
      BarcodeFormat.BarcodeFormat.DATA_MATRIX,
      ZXingSystem.ZXingSystem.currentTimeMillis()
    );
    const byteSegments = decoderResult.getByteSegments();
    if (byteSegments != null) {
      result.putMetadata(ResultMetadataType.ResultMetadataType.BYTE_SEGMENTS, byteSegments);
    }
    const ecLevel = decoderResult.getECLevel();
    if (ecLevel != null) {
      result.putMetadata(ResultMetadataType.ResultMetadataType.ERROR_CORRECTION_LEVEL, ecLevel);
    }
    return result;
  }
  // @Override
  reset() {
  }
  /**
   * This method detects a code in a "pure" image -- that is, pure monochrome image
   * which contains only an unrotated, unskewed, image of a code, with some white border
   * around it. This is a specialized method that works exceptionally fast in this special
   * case.
   *
   * @see com.google.zxing.qrcode.QRCodeReader#extractPureBits(BitMatrix)
   */
  static extractPureBits(image) {
    const leftTopBlack = image.getTopLeftOnBit();
    const rightBottomBlack = image.getBottomRightOnBit();
    if (leftTopBlack == null || rightBottomBlack == null) {
      throw new NotFoundException.NotFoundException();
    }
    const moduleSize = this.moduleSize(leftTopBlack, image);
    let top = leftTopBlack[1];
    const bottom = rightBottomBlack[1];
    let left = leftTopBlack[0];
    const right = rightBottomBlack[0];
    const matrixWidth = (right - left + 1) / moduleSize;
    const matrixHeight = (bottom - top + 1) / moduleSize;
    if (matrixWidth <= 0 || matrixHeight <= 0) {
      throw new NotFoundException.NotFoundException();
    }
    const nudge = moduleSize / 2;
    top += nudge;
    left += nudge;
    const bits = new BitMatrix.BitMatrix(matrixWidth, matrixHeight);
    for (let y = 0; y < matrixHeight; y++) {
      const iOffset = top + y * moduleSize;
      for (let x = 0; x < matrixWidth; x++) {
        if (image.get(left + x * moduleSize, iOffset)) {
          bits.set(x, y);
        }
      }
    }
    return bits;
  }
  static moduleSize(leftTopBlack, image) {
    const width = image.getWidth();
    let x = leftTopBlack[0];
    const y = leftTopBlack[1];
    while (x < width && image.get(x, y)) {
      x++;
    }
    if (x === width) {
      throw new NotFoundException.NotFoundException();
    }
    const moduleSize = x - leftTopBlack[0];
    if (moduleSize === 0) {
      throw new NotFoundException.NotFoundException();
    }
    return moduleSize;
  }
}

exports.DataMatrixReader = DataMatrixReader;
//# sourceMappingURL=DataMatrixReader.cjs.map
//# sourceMappingURL=DataMatrixReader.cjs.map