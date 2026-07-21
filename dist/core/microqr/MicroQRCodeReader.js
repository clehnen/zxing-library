import { Result } from '../Result';
import { BarcodeFormat } from '../BarcodeFormat';
import { DecodeHintType } from '../DecodeHintType';
import { ResultMetadataType } from '../ResultMetadataType';
import { ZXingSystem } from '../util/ZXingSystem';
import { MicroQRDecoder } from './decoder/MicroQRDecoder';
import { MicroQRDetector } from './detector/MicroQRDetector';

class MicroQRCodeReader {
  decoder = new MicroQRDecoder();
  decode(image, hints) {
    let decoderResult;
    let points;
    if (hints != null && hints.get(DecodeHintType.PURE_BARCODE) !== void 0) {
      const bits = image.getBlackMatrix();
      decoderResult = this.decoder.decodeBitMatrix(bits, hints ?? void 0);
      points = [];
    } else {
      const detector = new MicroQRDetector(image.getBlackMatrix());
      const detectorResult = detector.detect(hints ?? void 0);
      points = detectorResult.getPoints();
      decoderResult = this.decoder.decodeBitMatrix(detectorResult.getBits(), hints ?? void 0);
    }
    const result = new Result(
      decoderResult.getText(),
      decoderResult.getRawBytes(),
      decoderResult.getNumBits(),
      points,
      BarcodeFormat.MICRO_QR_CODE,
      ZXingSystem.currentTimeMillis()
    );
    const byteSegments = decoderResult.getByteSegments();
    if (byteSegments !== null) {
      result.putMetadata(ResultMetadataType.BYTE_SEGMENTS, byteSegments);
    }
    const ecLevel = decoderResult.getECLevel();
    if (ecLevel !== null) {
      result.putMetadata(ResultMetadataType.ERROR_CORRECTION_LEVEL, ecLevel);
    }
    return result;
  }
  reset() {
  }
}

export { MicroQRCodeReader };
//# sourceMappingURL=MicroQRCodeReader.js.map
//# sourceMappingURL=MicroQRCodeReader.js.map