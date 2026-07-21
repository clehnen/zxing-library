import { Result } from '../Result';
import { BarcodeFormat } from '../BarcodeFormat';
import { DecodeHintType } from '../DecodeHintType';
import { ResultMetadataType } from '../ResultMetadataType';
import { ZXingSystem } from '../util/ZXingSystem';
import { AztecDecoder } from './decoder/AztecDecoder';
import { AztecDetector } from './detector/AztecDetector';

class AztecCodeReader {
  /**
   * Locates and decodes a Data Matrix code in an image.
   *
   * @return a String representing the content encoded by the Data Matrix code
   * @throws NotFoundException if a Data Matrix code cannot be found
   * @throws FormatException if a Data Matrix code cannot be decoded
   */
  decode(image, hints = null) {
    let exception = null;
    let detector = new AztecDetector(image.getBlackMatrix());
    let points = null;
    let decoderResult = null;
    try {
      let detectorResult = detector.detectMirror(false);
      points = detectorResult.getPoints();
      this.reportFoundResultPoints(hints, points);
      decoderResult = new AztecDecoder().decode(detectorResult);
    } catch (e) {
      exception = e;
    }
    if (decoderResult == null) {
      try {
        let detectorResult = detector.detectMirror(true);
        points = detectorResult.getPoints();
        this.reportFoundResultPoints(hints, points);
        decoderResult = new AztecDecoder().decode(detectorResult);
      } catch (e) {
        if (exception != null) {
          throw exception;
        }
        throw e;
      }
    }
    let result = new Result(
      decoderResult.getText(),
      decoderResult.getRawBytes(),
      decoderResult.getNumBits(),
      points,
      BarcodeFormat.AZTEC,
      ZXingSystem.currentTimeMillis()
    );
    let byteSegments = decoderResult.getByteSegments();
    if (byteSegments != null) {
      result.putMetadata(ResultMetadataType.BYTE_SEGMENTS, byteSegments);
    }
    let ecLevel = decoderResult.getECLevel();
    if (ecLevel != null) {
      result.putMetadata(ResultMetadataType.ERROR_CORRECTION_LEVEL, ecLevel);
    }
    return result;
  }
  reportFoundResultPoints(hints, points) {
    if (hints != null) {
      let rpcb = hints.get(DecodeHintType.NEED_RESULT_POINT_CALLBACK);
      if (rpcb != null) {
        points.forEach((point, idx, arr) => {
          rpcb.foundPossibleResultPoint(point);
        });
      }
    }
  }
  // @Override
  reset() {
  }
}

export { AztecCodeReader };
//# sourceMappingURL=AztecCodeReader.js.map
//# sourceMappingURL=AztecCodeReader.js.map