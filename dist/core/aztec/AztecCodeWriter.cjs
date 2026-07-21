'use strict';

var BarcodeFormat = require('../BarcodeFormat');
var EncodeHintType = require('../EncodeHintType');
var AztecEncoder = require('./encoder/AztecEncoder');
var BitMatrix = require('../common/BitMatrix');
var ZXingCharset = require('../util/ZXingCharset');
var ZXingStandardCharsets = require('../util/ZXingStandardCharsets');
var ZXingInteger = require('../util/ZXingInteger');
var IllegalStateException = require('../IllegalStateException');
var IllegalArgumentException = require('../IllegalArgumentException');
var StringUtils = require('../common/StringUtils');

class AztecCodeWriter {
  // @Override
  encode(contents, format, width, height) {
    return this.encodeWithHints(contents, format, width, height, null);
  }
  // @Override
  encodeWithHints(contents, format, width, height, hints) {
    let charset = ZXingStandardCharsets.ZXingStandardCharsets.ISO_8859_1;
    let eccPercent = AztecEncoder.AztecEncoder.DEFAULT_EC_PERCENT;
    let layers = AztecEncoder.AztecEncoder.DEFAULT_AZTEC_LAYERS;
    if (hints != null) {
      if (hints.has(EncodeHintType.EncodeHintType.CHARACTER_SET)) {
        charset = ZXingCharset.ZXingCharset.forName(hints.get(EncodeHintType.EncodeHintType.CHARACTER_SET).toString());
      }
      if (hints.has(EncodeHintType.EncodeHintType.ERROR_CORRECTION)) {
        eccPercent = ZXingInteger.ZXingInteger.parseInt(hints.get(EncodeHintType.EncodeHintType.ERROR_CORRECTION).toString());
      }
      if (hints.has(EncodeHintType.EncodeHintType.AZTEC_LAYERS)) {
        layers = ZXingInteger.ZXingInteger.parseInt(hints.get(EncodeHintType.EncodeHintType.AZTEC_LAYERS).toString());
      }
    }
    return AztecCodeWriter.encodeLayers(contents, format, width, height, charset, eccPercent, layers);
  }
  static encodeLayers(contents, format, width, height, charset, eccPercent, layers) {
    if (format !== BarcodeFormat.BarcodeFormat.AZTEC) {
      throw new IllegalArgumentException.IllegalArgumentException("Can only encode AZTEC, but got " + format);
    }
    let aztec = AztecEncoder.AztecEncoder.encode(StringUtils.StringUtils.getBytes(contents, charset), eccPercent, layers);
    return AztecCodeWriter.renderResult(aztec, width, height);
  }
  static renderResult(code, width, height) {
    let input = code.getMatrix();
    if (input == null) {
      throw new IllegalStateException.IllegalStateException();
    }
    let inputWidth = input.getWidth();
    let inputHeight = input.getHeight();
    let outputWidth = Math.max(width, inputWidth);
    let outputHeight = Math.max(height, inputHeight);
    let multiple = Math.min(outputWidth / inputWidth, outputHeight / inputHeight);
    let leftPadding = (outputWidth - inputWidth * multiple) / 2;
    let topPadding = (outputHeight - inputHeight * multiple) / 2;
    let output = new BitMatrix.BitMatrix(outputWidth, outputHeight);
    for (let inputY = 0, outputY = topPadding; inputY < inputHeight; inputY++, outputY += multiple) {
      for (let inputX = 0, outputX = leftPadding; inputX < inputWidth; inputX++, outputX += multiple) {
        if (input.get(inputX, inputY)) {
          output.setRegion(outputX, outputY, multiple, multiple);
        }
      }
    }
    return output;
  }
}

exports.AztecCodeWriter = AztecCodeWriter;
//# sourceMappingURL=AztecCodeWriter.cjs.map
//# sourceMappingURL=AztecCodeWriter.cjs.map