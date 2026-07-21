'use strict';

var Result = require('../Result');
var BarcodeFormat = require('../BarcodeFormat');
var DecodeHintType = require('../DecodeHintType');
var ResultMetadataType = require('../ResultMetadataType');
var ZXingSystem = require('../util/ZXingSystem');
var MicroQRDecoder = require('./decoder/MicroQRDecoder');
var MicroQRDetector = require('./detector/MicroQRDetector');

class MicroQRCodeReader {
  decoder = new MicroQRDecoder.MicroQRDecoder();
  decode(image, hints) {
    let decoderResult;
    let points;
    if (hints != null && hints.get(DecodeHintType.DecodeHintType.PURE_BARCODE) !== void 0) {
      const bits = image.getBlackMatrix();
      decoderResult = this.decoder.decodeBitMatrix(bits, hints ?? void 0);
      points = [];
    } else {
      const detector = new MicroQRDetector.MicroQRDetector(image.getBlackMatrix());
      const detectorResult = detector.detect(hints ?? void 0);
      points = detectorResult.getPoints();
      decoderResult = this.decoder.decodeBitMatrix(detectorResult.getBits(), hints ?? void 0);
    }
    const result = new Result.Result(
      decoderResult.getText(),
      decoderResult.getRawBytes(),
      decoderResult.getNumBits(),
      points,
      BarcodeFormat.BarcodeFormat.MICRO_QR_CODE,
      ZXingSystem.ZXingSystem.currentTimeMillis()
    );
    const byteSegments = decoderResult.getByteSegments();
    if (byteSegments !== null) {
      result.putMetadata(ResultMetadataType.ResultMetadataType.BYTE_SEGMENTS, byteSegments);
    }
    const ecLevel = decoderResult.getECLevel();
    if (ecLevel !== null) {
      result.putMetadata(ResultMetadataType.ResultMetadataType.ERROR_CORRECTION_LEVEL, ecLevel);
    }
    return result;
  }
  reset() {
  }
}

exports.MicroQRCodeReader = MicroQRCodeReader;
//# sourceMappingURL=MicroQRCodeReader.cjs.map
//# sourceMappingURL=MicroQRCodeReader.cjs.map