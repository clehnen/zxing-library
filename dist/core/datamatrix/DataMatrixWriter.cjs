'use strict';

var BarcodeFormat = require('../BarcodeFormat');
var BitMatrix = require('../common/BitMatrix');
var EncodeHintType = require('../EncodeHintType');
var QRCodeByteMatrix = require('../qrcode/encoder/QRCodeByteMatrix');
var ZXingCharset = require('../util/ZXingCharset');
var encoder = require('./encoder');
var constants = require('./encoder/constants');

class DataMatrixWriter {
  encode(contents, format, width, height, hints = null) {
    if (contents.trim() === "") {
      throw new Error("Found empty contents");
    }
    if (format !== BarcodeFormat.BarcodeFormat.DATA_MATRIX) {
      throw new Error("Can only encode DATA_MATRIX, but got " + format);
    }
    if (width < 0 || height < 0) {
      throw new Error(
        "Requested dimensions can't be negative: " + width + "x" + height
      );
    }
    let shape = constants.SymbolShapeHint.FORCE_NONE;
    let minSize = null;
    let maxSize = null;
    if (hints != null) {
      const requestedShape = hints.get(
        EncodeHintType.EncodeHintType.DATA_MATRIX_SHAPE
      );
      if (requestedShape != null) {
        shape = requestedShape;
      }
      const requestedMinSize = hints.get(EncodeHintType.EncodeHintType.MIN_SIZE);
      if (requestedMinSize != null) {
        minSize = requestedMinSize;
      }
      const requestedMaxSize = hints.get(EncodeHintType.EncodeHintType.MAX_SIZE);
      if (requestedMaxSize != null) {
        maxSize = requestedMaxSize;
      }
    }
    let encoded;
    const hasCompactionHint = hints != null && hints.has(EncodeHintType.EncodeHintType.DATA_MATRIX_COMPACT) && Boolean(hints.get(EncodeHintType.EncodeHintType.DATA_MATRIX_COMPACT).toString());
    if (hasCompactionHint) {
      const hasGS1FormatHint = hints.has(EncodeHintType.EncodeHintType.GS1_FORMAT) && Boolean(hints.get(EncodeHintType.EncodeHintType.GS1_FORMAT).toString());
      let charset = null;
      const hasEncodingHint = hints.has(EncodeHintType.EncodeHintType.CHARACTER_SET);
      if (hasEncodingHint) {
        charset = ZXingCharset.ZXingCharset.forName(
          hints.get(EncodeHintType.EncodeHintType.CHARACTER_SET).toString()
        );
      }
      encoded = encoder.MinimalEncoder.encodeHighLevel(
        contents,
        charset,
        hasGS1FormatHint ? 29 : -1,
        shape
      );
    } else {
      const hasForceC40Hint = hints != null && hints.has(EncodeHintType.EncodeHintType.FORCE_C40) && Boolean(hints.get(EncodeHintType.EncodeHintType.FORCE_C40).toString());
      encoded = encoder.DataMatrixHighLevelEncoder.encodeHighLevel(
        contents,
        shape,
        minSize,
        maxSize,
        hasForceC40Hint
      );
    }
    const symbolInfo = encoder.DataMatrixSymbolInfo.lookup(
      encoded.length,
      shape,
      minSize,
      maxSize,
      true
    );
    const codewords = encoder.DataMatrixErrorCorrection.encodeECC200(encoded, symbolInfo);
    const placement = new encoder.DataMatrixDefaultPlacement(
      codewords,
      symbolInfo.getSymbolDataWidth(),
      symbolInfo.getSymbolDataHeight()
    );
    placement.place();
    return this.encodeLowLevel(placement, symbolInfo, width, height);
  }
  /**
   * Encode the given symbol info to a bit matrix.
   *
   * @param placement  The DataMatrix placement.
   * @param symbolInfo The symbol info to encode.
   * @return The bit matrix generated.
   */
  encodeLowLevel(placement, symbolInfo, width, height) {
    const symbolWidth = symbolInfo.getSymbolDataWidth();
    const symbolHeight = symbolInfo.getSymbolDataHeight();
    const matrix = new QRCodeByteMatrix.QRCodeByteMatrix(
      symbolInfo.getSymbolWidth(),
      symbolInfo.getSymbolHeight()
    );
    let matrixY = 0;
    for (let y = 0; y < symbolHeight; y++) {
      let matrixX;
      if (y % symbolInfo.matrixHeight === 0) {
        matrixX = 0;
        for (let x = 0; x < symbolInfo.getSymbolWidth(); x++) {
          matrix.setBoolean(matrixX, matrixY, x % 2 === 0);
          matrixX++;
        }
        matrixY++;
      }
      matrixX = 0;
      for (let x = 0; x < symbolWidth; x++) {
        if (x % symbolInfo.matrixWidth === 0) {
          matrix.setBoolean(matrixX, matrixY, true);
          matrixX++;
        }
        matrix.setBoolean(matrixX, matrixY, placement.getBit(x, y));
        matrixX++;
        if (x % symbolInfo.matrixWidth === symbolInfo.matrixWidth - 1) {
          matrix.setBoolean(matrixX, matrixY, y % 2 === 0);
          matrixX++;
        }
      }
      matrixY++;
      if (y % symbolInfo.matrixHeight === symbolInfo.matrixHeight - 1) {
        matrixX = 0;
        for (let x = 0; x < symbolInfo.getSymbolWidth(); x++) {
          matrix.setBoolean(matrixX, matrixY, true);
          matrixX++;
        }
        matrixY++;
      }
    }
    return this.convertByteMatrixToBitMatrix(matrix, width, height);
  }
  /**
   * Convert the ByteMatrix to BitMatrix.
   *
   * @param reqHeight The requested height of the image (in pixels) with the Datamatrix code
   * @param reqWidth The requested width of the image (in pixels) with the Datamatrix code
   * @param matrix The input matrix.
   * @return The output matrix.
   */
  convertByteMatrixToBitMatrix(matrix, reqWidth, reqHeight) {
    const matrixWidth = matrix.getWidth();
    const matrixHeight = matrix.getHeight();
    const outputWidth = Math.max(reqWidth, matrixWidth);
    const outputHeight = Math.max(reqHeight, matrixHeight);
    const multiple = Math.min(
      outputWidth / matrixWidth,
      outputHeight / matrixHeight
    );
    let leftPadding = (outputWidth - matrixWidth * multiple) / 2;
    let topPadding = (outputHeight - matrixHeight * multiple) / 2;
    let output;
    if (reqHeight < matrixHeight || reqWidth < matrixWidth) {
      leftPadding = 0;
      topPadding = 0;
      output = new BitMatrix.BitMatrix(matrixWidth, matrixHeight);
    } else {
      output = new BitMatrix.BitMatrix(reqWidth, reqHeight);
    }
    output.clear();
    for (let inputY = 0, outputY = topPadding; inputY < matrixHeight; inputY++, outputY += multiple) {
      for (let inputX = 0, outputX = leftPadding; inputX < matrixWidth; inputX++, outputX += multiple) {
        if (matrix.get(inputX, inputY) === 1) {
          output.setRegion(outputX, outputY, multiple, multiple);
        }
      }
    }
    return output;
  }
}

exports.DataMatrixWriter = DataMatrixWriter;
//# sourceMappingURL=DataMatrixWriter.cjs.map
//# sourceMappingURL=DataMatrixWriter.cjs.map