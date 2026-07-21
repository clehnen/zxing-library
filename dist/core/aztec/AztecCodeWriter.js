import { BarcodeFormat } from '../BarcodeFormat';
import { EncodeHintType } from '../EncodeHintType';
import { AztecEncoder } from './encoder/AztecEncoder';
import { BitMatrix } from '../common/BitMatrix';
import { ZXingCharset } from '../util/ZXingCharset';
import { ZXingStandardCharsets } from '../util/ZXingStandardCharsets';
import { ZXingInteger } from '../util/ZXingInteger';
import { IllegalStateException } from '../IllegalStateException';
import { IllegalArgumentException } from '../IllegalArgumentException';
import { StringUtils } from '../common/StringUtils';

class AztecCodeWriter {
  // @Override
  encode(contents, format, width, height) {
    return this.encodeWithHints(contents, format, width, height, null);
  }
  // @Override
  encodeWithHints(contents, format, width, height, hints) {
    let charset = ZXingStandardCharsets.ISO_8859_1;
    let eccPercent = AztecEncoder.DEFAULT_EC_PERCENT;
    let layers = AztecEncoder.DEFAULT_AZTEC_LAYERS;
    if (hints != null) {
      if (hints.has(EncodeHintType.CHARACTER_SET)) {
        charset = ZXingCharset.forName(hints.get(EncodeHintType.CHARACTER_SET).toString());
      }
      if (hints.has(EncodeHintType.ERROR_CORRECTION)) {
        eccPercent = ZXingInteger.parseInt(hints.get(EncodeHintType.ERROR_CORRECTION).toString());
      }
      if (hints.has(EncodeHintType.AZTEC_LAYERS)) {
        layers = ZXingInteger.parseInt(hints.get(EncodeHintType.AZTEC_LAYERS).toString());
      }
    }
    return AztecCodeWriter.encodeLayers(contents, format, width, height, charset, eccPercent, layers);
  }
  static encodeLayers(contents, format, width, height, charset, eccPercent, layers) {
    if (format !== BarcodeFormat.AZTEC) {
      throw new IllegalArgumentException("Can only encode AZTEC, but got " + format);
    }
    let aztec = AztecEncoder.encode(StringUtils.getBytes(contents, charset), eccPercent, layers);
    return AztecCodeWriter.renderResult(aztec, width, height);
  }
  static renderResult(code, width, height) {
    let input = code.getMatrix();
    if (input == null) {
      throw new IllegalStateException();
    }
    let inputWidth = input.getWidth();
    let inputHeight = input.getHeight();
    let outputWidth = Math.max(width, inputWidth);
    let outputHeight = Math.max(height, inputHeight);
    let multiple = Math.min(outputWidth / inputWidth, outputHeight / inputHeight);
    let leftPadding = (outputWidth - inputWidth * multiple) / 2;
    let topPadding = (outputHeight - inputHeight * multiple) / 2;
    let output = new BitMatrix(outputWidth, outputHeight);
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

export { AztecCodeWriter };
//# sourceMappingURL=AztecCodeWriter.js.map
//# sourceMappingURL=AztecCodeWriter.js.map