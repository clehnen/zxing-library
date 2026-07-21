import { BarcodeFormat } from '../BarcodeFormat';
import { EncodeHintType } from '../EncodeHintType';
import { BitMatrix } from '../common/BitMatrix';
import { QRCodeDecoderErrorCorrectionLevel } from './decoder/QRCodeDecoderErrorCorrectionLevel';
import { QRCodeEncoder } from './encoder/QRCodeEncoder';
import { IllegalArgumentException } from '../IllegalArgumentException';
import { IllegalStateException } from '../IllegalStateException';

class QRCodeWriter {
  static QUIET_ZONE_SIZE = 4;
  /*@Override*/
  // public encode(contents: string, format: BarcodeFormat, width: number /*int*/, height: number /*int*/): BitMatrix
  //     /*throws WriterException */ {
  //   return encode(contents, format, width, height, null)
  // }
  /*@Override*/
  encode(contents, format, width, height, hints) {
    if (contents.length === 0) {
      throw new IllegalArgumentException("Found empty contents");
    }
    if (format !== BarcodeFormat.QR_CODE) {
      throw new IllegalArgumentException("Can only encode QR_CODE, but got " + format);
    }
    if (width < 0 || height < 0) {
      throw new IllegalArgumentException(`Requested dimensions are too small: ${width}x${height}`);
    }
    let errorCorrectionLevel = QRCodeDecoderErrorCorrectionLevel.L;
    let quietZone = QRCodeWriter.QUIET_ZONE_SIZE;
    if (hints !== null) {
      if (void 0 !== hints.get(EncodeHintType.ERROR_CORRECTION)) {
        errorCorrectionLevel = QRCodeDecoderErrorCorrectionLevel.fromString(hints.get(EncodeHintType.ERROR_CORRECTION).toString());
      }
      if (void 0 !== hints.get(EncodeHintType.MARGIN)) {
        quietZone = Number.parseInt(hints.get(EncodeHintType.MARGIN).toString(), 10);
      }
    }
    const code = QRCodeEncoder.encode(contents, errorCorrectionLevel, hints);
    return QRCodeWriter.renderResult(code, width, height, quietZone);
  }
  // Note that the input matrix uses 0 == white, 1 == black, while the output matrix uses
  // 0 == black, 255 == white (i.e. an 8 bit greyscale bitmap).
  static renderResult(code, width, height, quietZone) {
    const input = code.getMatrix();
    if (input === null) {
      throw new IllegalStateException();
    }
    const inputWidth = input.getWidth();
    const inputHeight = input.getHeight();
    const qrWidth = inputWidth + quietZone * 2;
    const qrHeight = inputHeight + quietZone * 2;
    const outputWidth = Math.max(width, qrWidth);
    const outputHeight = Math.max(height, qrHeight);
    const multiple = Math.min(Math.floor(outputWidth / qrWidth), Math.floor(outputHeight / qrHeight));
    const leftPadding = Math.floor((outputWidth - inputWidth * multiple) / 2);
    const topPadding = Math.floor((outputHeight - inputHeight * multiple) / 2);
    const output = new BitMatrix(outputWidth, outputHeight);
    for (let inputY = 0, outputY = topPadding; inputY < inputHeight; inputY++, outputY += multiple) {
      for (let inputX = 0, outputX = leftPadding; inputX < inputWidth; inputX++, outputX += multiple) {
        if (input.get(inputX, inputY) === 1) {
          output.setRegion(outputX, outputY, multiple, multiple);
        }
      }
    }
    return output;
  }
}

export { QRCodeWriter };
//# sourceMappingURL=QRCodeWriter.js.map
//# sourceMappingURL=QRCodeWriter.js.map