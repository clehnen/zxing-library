import { EncodeHintType } from '../core/EncodeHintType';
import { QRCodeEncoder } from '../core/qrcode/encoder/QRCodeEncoder';
import { QRCodeDecoderErrorCorrectionLevel } from '../core/qrcode/decoder/QRCodeDecoderErrorCorrectionLevel';
import { IllegalArgumentException } from '../core/IllegalArgumentException';
import { IllegalStateException } from '../core/IllegalStateException';

class BrowserQRCodeSvgWriter {
  static QUIET_ZONE_SIZE = 4;
  /**
   * SVG markup NameSpace
   */
  static SVG_NS = "http://www.w3.org/2000/svg";
  /**
   * Writes and renders a QRCode SVG element.
   *
   * @param contents
   * @param width
   * @param height
   * @param hints
   */
  write(contents, width, height, hints = null) {
    if (contents.length === 0) {
      throw new IllegalArgumentException("Found empty contents");
    }
    if (width < 0 || height < 0) {
      throw new IllegalArgumentException("Requested dimensions are too small: " + width + "x" + height);
    }
    let errorCorrectionLevel = QRCodeDecoderErrorCorrectionLevel.L;
    let quietZone = BrowserQRCodeSvgWriter.QUIET_ZONE_SIZE;
    if (hints !== null) {
      if (void 0 !== hints.get(EncodeHintType.ERROR_CORRECTION)) {
        errorCorrectionLevel = QRCodeDecoderErrorCorrectionLevel.fromString(hints.get(EncodeHintType.ERROR_CORRECTION).toString());
      }
      if (void 0 !== hints.get(EncodeHintType.MARGIN)) {
        quietZone = Number.parseInt(hints.get(EncodeHintType.MARGIN).toString(), 10);
      }
    }
    const code = QRCodeEncoder.encode(contents, errorCorrectionLevel, hints);
    return this.renderResult(code, width, height, quietZone);
  }
  /**
   * Renders the result and then appends it to the DOM.
   */
  writeToDom(containerElement, contents, width, height, hints = null) {
    if (typeof containerElement === "string") {
      containerElement = document.querySelector(containerElement);
    }
    const svgElement = this.write(contents, width, height, hints);
    if (containerElement)
      containerElement.appendChild(svgElement);
  }
  /**
   * Note that the input matrix uses 0 == white, 1 == black.
   * The output matrix uses 0 == black, 255 == white (i.e. an 8 bit greyscale bitmap).
   */
  renderResult(code, width, height, quietZone) {
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
    const svgElement = this.createSVGElement(outputWidth, outputHeight);
    for (let inputY = 0, outputY = topPadding; inputY < inputHeight; inputY++, outputY += multiple) {
      for (let inputX = 0, outputX = leftPadding; inputX < inputWidth; inputX++, outputX += multiple) {
        if (input.get(inputX, inputY) === 1) {
          const svgRectElement = this.createSvgRectElement(outputX, outputY, multiple, multiple);
          svgElement.appendChild(svgRectElement);
        }
      }
    }
    return svgElement;
  }
  /**
   * Creates a SVG element.
   *
   * @param w SVG's width attribute
   * @param h SVG's height attribute
   */
  createSVGElement(w, h) {
    const svgElement = document.createElementNS(BrowserQRCodeSvgWriter.SVG_NS, "svg");
    svgElement.setAttributeNS(null, "height", w.toString());
    svgElement.setAttributeNS(null, "width", h.toString());
    return svgElement;
  }
  /**
   * Creates a SVG rect element.
   *
   * @param x Element's x coordinate
   * @param y Element's y coordinate
   * @param w Element's width attribute
   * @param h Element's height attribute
   */
  createSvgRectElement(x, y, w, h) {
    const rect = document.createElementNS(BrowserQRCodeSvgWriter.SVG_NS, "rect");
    rect.setAttributeNS(null, "x", x.toString());
    rect.setAttributeNS(null, "y", y.toString());
    rect.setAttributeNS(null, "height", w.toString());
    rect.setAttributeNS(null, "width", h.toString());
    rect.setAttributeNS(null, "fill", "#000000");
    return rect;
  }
}

export { BrowserQRCodeSvgWriter };
//# sourceMappingURL=BrowserQRCodeSvgWriter.js.map
//# sourceMappingURL=BrowserQRCodeSvgWriter.js.map