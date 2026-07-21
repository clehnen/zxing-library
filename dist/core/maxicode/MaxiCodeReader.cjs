'use strict';

var BarcodeFormat = require('../BarcodeFormat');
var BitMatrix = require('../common/BitMatrix');
var NotFoundException = require('../NotFoundException');
var Result = require('../Result');
var ResultMetadataType = require('../ResultMetadataType');
var ZXingSystem = require('../util/ZXingSystem');
var MaxiCodeDecoder = require('./decoder/MaxiCodeDecoder');

class MaxiCodeReader {
  static NO_POINTS = [];
  static MATRIX_WIDTH = 30;
  static MATRIX_HEIGHT = 33;
  decoder = new MaxiCodeDecoder.MaxiCodeDecoder();
  decode(image, hints = null) {
    const bits = MaxiCodeReader.extractPureBits(image.getBlackMatrix());
    const decoderResult = this.decoder.decode(bits, hints);
    const result = new Result.Result(
      decoderResult.getText(),
      decoderResult.getRawBytes(),
      8 * decoderResult.getRawBytes().length,
      MaxiCodeReader.NO_POINTS,
      BarcodeFormat.BarcodeFormat.MAXICODE,
      ZXingSystem.ZXingSystem.currentTimeMillis()
    );
    result.putMetadata(ResultMetadataType.ResultMetadataType.ERRORS_CORRECTED, decoderResult.getErrorsCorrected());
    const ecLevel = decoderResult.getECLevel();
    if (ecLevel != null) {
      result.putMetadata(ResultMetadataType.ResultMetadataType.ERROR_CORRECTION_LEVEL, ecLevel);
    }
    return result;
  }
  reset() {
  }
  static extractPureBits(image) {
    const enclosingRectangle = image.getEnclosingRectangle();
    if (enclosingRectangle == null) {
      throw new NotFoundException.NotFoundException();
    }
    const left = enclosingRectangle[0];
    const top = enclosingRectangle[1];
    const width = enclosingRectangle[2];
    const height = enclosingRectangle[3];
    const bits = new BitMatrix.BitMatrix(MaxiCodeReader.MATRIX_WIDTH, MaxiCodeReader.MATRIX_HEIGHT);
    for (let y = 0; y < MaxiCodeReader.MATRIX_HEIGHT; y++) {
      const iy = top + Math.min(Math.floor((y * height + height / 2) / MaxiCodeReader.MATRIX_HEIGHT), height - 1);
      for (let x = 0; x < MaxiCodeReader.MATRIX_WIDTH; x++) {
        const ix = left + Math.min(
          Math.floor((x * width + width / 2 + (y & 1) * Math.floor(width / 2)) / MaxiCodeReader.MATRIX_WIDTH),
          width - 1
        );
        if (image.get(ix, iy)) {
          bits.set(x, y);
        }
      }
    }
    return bits;
  }
}

exports.MaxiCodeReader = MaxiCodeReader;
//# sourceMappingURL=MaxiCodeReader.cjs.map
//# sourceMappingURL=MaxiCodeReader.cjs.map