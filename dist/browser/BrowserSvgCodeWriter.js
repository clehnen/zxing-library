import { EncodeHintType } from '../core/EncodeHintType';
import { QRCodeEncoder } from '../core/qrcode/encoder/QRCodeEncoder';
import { QRCodeDecoderErrorCorrectionLevel } from '../core/qrcode/decoder/QRCodeDecoderErrorCorrectionLevel';
import { IllegalArgumentException } from '../core/IllegalArgumentException';
import { IllegalStateException } from '../core/IllegalStateException';

class BrowserSvgCodeWriter {
  /**
   * Default quiet zone in pixels.
   */
  static QUIET_ZONE_SIZE = 4;
  /**
   * SVG markup NameSpace
   */
  static SVG_NS = "http://www.w3.org/2000/svg";
  /**
   * A HTML container element for the image.
   */
  containerElement;
  /**
   * Constructs. 😉
   */
  constructor(containerElement) {
    if (typeof containerElement === "string") {
      this.containerElement = document.getElementById(containerElement);
    } else {
      this.containerElement = containerElement;
    }
  }
  /**
   * Writes the QR code to a SVG and renders it in the container.
   */
  write(contents, width, height, hints = null) {
    if (contents.length === 0) {
      throw new IllegalArgumentException("Found empty contents");
    }
    if (width < 0 || height < 0) {
      throw new IllegalArgumentException("Requested dimensions are too small: " + width + "x" + height);
    }
    let quietZone = hints && hints.get(EncodeHintType.MARGIN) !== void 0 ? Number.parseInt(hints.get(EncodeHintType.MARGIN).toString(), 10) : BrowserSvgCodeWriter.QUIET_ZONE_SIZE;
    const code = this.encode(hints, contents);
    return this.renderResult(code, width, height, quietZone);
  }
  /**
   * Encodes the content to a Barcode type.
   */
  encode(hints, contents) {
    let errorCorrectionLevel = QRCodeDecoderErrorCorrectionLevel.L;
    if (hints && hints.get(EncodeHintType.ERROR_CORRECTION) !== void 0) {
      errorCorrectionLevel = QRCodeDecoderErrorCorrectionLevel.fromString(hints.get(EncodeHintType.ERROR_CORRECTION).toString());
    }
    const code = QRCodeEncoder.encode(contents, errorCorrectionLevel, hints);
    return code;
  }
  /**
   * Renders the SVG in the container.
   *
   * @note the input matrix uses 0 == white, 1 == black. The output matrix uses 0 == black, 255 == white (i.e. an 8 bit greyscale bitmap).
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
    const placeholder = this.createSvgPathPlaceholderElement(width, height);
    svgElement.append(placeholder);
    this.containerElement.appendChild(svgElement);
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
   */
  createSVGElement(w, h) {
    const el = document.createElementNS(BrowserSvgCodeWriter.SVG_NS, "svg");
    el.setAttributeNS(null, "width", h.toString());
    el.setAttributeNS(null, "height", w.toString());
    return el;
  }
  /**
   * Creates a SVG rect.
   */
  createSvgPathPlaceholderElement(w, h) {
    const el = document.createElementNS(BrowserSvgCodeWriter.SVG_NS, "path");
    el.setAttributeNS(null, "d", `M0 0h${w}v${h}H0z`);
    el.setAttributeNS(null, "fill", "none");
    return el;
  }
  /**
   * Creates a SVG rect.
   */
  createSvgRectElement(x, y, w, h) {
    const el = document.createElementNS(BrowserSvgCodeWriter.SVG_NS, "rect");
    el.setAttributeNS(null, "x", x.toString());
    el.setAttributeNS(null, "y", y.toString());
    el.setAttributeNS(null, "height", w.toString());
    el.setAttributeNS(null, "width", h.toString());
    el.setAttributeNS(null, "fill", "#000000");
    return el;
  }
}

export { BrowserSvgCodeWriter };
//# sourceMappingURL=BrowserSvgCodeWriter.js.map
//# sourceMappingURL=BrowserSvgCodeWriter.js.map