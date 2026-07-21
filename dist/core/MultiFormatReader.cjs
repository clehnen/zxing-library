'use strict';

var DecodeHintType = require('./DecodeHintType');
var BarcodeFormat = require('./BarcodeFormat');
var QRCodeReader = require('./qrcode/QRCodeReader');
var MicroQRCodeReader = require('./microqr/MicroQRCodeReader');
var AztecCodeReader = require('./aztec/AztecCodeReader');
var MultiFormatOneDReader = require('./oned/MultiFormatOneDReader');
var DataMatrixReader = require('./datamatrix/DataMatrixReader');
var MaxiCodeReader = require('./maxicode/MaxiCodeReader');
var NotFoundException = require('./NotFoundException');
var PDF417Reader = require('./pdf417/PDF417Reader');
var ReaderException = require('./ReaderException');

class MultiFormatReader {
  hints;
  readers;
  /**
   * This version of decode honors the intent of Reader.decode(BinaryBitmap) in that it
   * passes null as a hint to the decoders. However, that makes it inefficient to call repeatedly.
   * Use setHints() followed by decodeWithState() for continuous scan applications.
   *
   * @param image The pixel data to decode
   * @return The contents of the image
   *
   * @throws NotFoundException Any errors which occurred
   */
  /*@Override*/
  // public decode(image: BinaryBitmap): Result {
  //   setHints(null)
  //   return decodeInternal(image)
  // }
  /**
   * Decode an image using the hints provided. Does not honor existing state.
   *
   * @param image The pixel data to decode
   * @param hints The hints to use, clearing the previous state.
   * @return The contents of the image
   *
   * @throws NotFoundException Any errors which occurred
   */
  /*@Override*/
  decode(image, hints) {
    if (this.hints !== hints) {
      this.setHints(hints);
    }
    return this.decodeInternal(image);
  }
  /**
   * Decode an image using the state set up by calling setHints() previously. Continuous scan
   * clients will get a <b>large</b> speed increase by using this instead of decode().
   *
   * @param image The pixel data to decode
   * @return The contents of the image
   *
   * @throws NotFoundException Any errors which occurred
   */
  decodeWithState(image) {
    if (this.readers === null || this.readers === void 0) {
      this.setHints(null);
    }
    return this.decodeInternal(image);
  }
  /**
   * This method adds state to the MultiFormatReader. By setting the hints once, subsequent calls
   * to decodeWithState(image) can reuse the same set of readers without reallocating memory. This
   * is important for performance in continuous scan clients.
   *
   * @param hints The set of hints to use for subsequent calls to decode(image)
   */
  setHints(hints) {
    this.hints = hints;
    const tryHarder = hints !== null && hints !== void 0 && void 0 !== hints.get(DecodeHintType.DecodeHintType.TRY_HARDER);
    const formats = hints === null || hints === void 0 ? null : hints.get(DecodeHintType.DecodeHintType.POSSIBLE_FORMATS);
    const readers = new Array();
    if (formats !== null && formats !== void 0) {
      const addOneDReader = formats.some(
        (f) => f === BarcodeFormat.BarcodeFormat.UPC_A || f === BarcodeFormat.BarcodeFormat.UPC_E || f === BarcodeFormat.BarcodeFormat.EAN_13 || f === BarcodeFormat.BarcodeFormat.EAN_8 || f === BarcodeFormat.BarcodeFormat.CODABAR || f === BarcodeFormat.BarcodeFormat.CODE_39 || f === BarcodeFormat.BarcodeFormat.CODE_93 || f === BarcodeFormat.BarcodeFormat.CODE_128 || f === BarcodeFormat.BarcodeFormat.ITF || f === BarcodeFormat.BarcodeFormat.RSS_14 || f === BarcodeFormat.BarcodeFormat.RSS_EXPANDED
      );
      if (addOneDReader && !tryHarder) {
        readers.push(new MultiFormatOneDReader.MultiFormatOneDReader(hints));
      }
      if (formats.includes(BarcodeFormat.BarcodeFormat.QR_CODE)) {
        readers.push(new QRCodeReader.QRCodeReader());
      }
      if (formats.includes(BarcodeFormat.BarcodeFormat.MICRO_QR_CODE)) {
        readers.push(new MicroQRCodeReader.MicroQRCodeReader());
      }
      if (formats.includes(BarcodeFormat.BarcodeFormat.DATA_MATRIX)) {
        readers.push(new DataMatrixReader.DataMatrixReader());
      }
      if (formats.includes(BarcodeFormat.BarcodeFormat.AZTEC)) {
        readers.push(new AztecCodeReader.AztecCodeReader());
      }
      if (formats.includes(BarcodeFormat.BarcodeFormat.PDF_417)) {
        readers.push(new PDF417Reader.PDF417Reader());
      }
      if (formats.includes(BarcodeFormat.BarcodeFormat.MAXICODE)) {
        readers.push(new MaxiCodeReader.MaxiCodeReader());
      }
      if (addOneDReader && tryHarder) {
        readers.push(new MultiFormatOneDReader.MultiFormatOneDReader(hints));
      }
    }
    if (readers.length === 0) {
      if (!tryHarder) {
        readers.push(new MultiFormatOneDReader.MultiFormatOneDReader(hints));
      }
      readers.push(new QRCodeReader.QRCodeReader());
      readers.push(new MicroQRCodeReader.MicroQRCodeReader());
      readers.push(new DataMatrixReader.DataMatrixReader());
      readers.push(new AztecCodeReader.AztecCodeReader());
      readers.push(new PDF417Reader.PDF417Reader());
      readers.push(new MaxiCodeReader.MaxiCodeReader());
      if (tryHarder) {
        readers.push(new MultiFormatOneDReader.MultiFormatOneDReader(hints));
      }
    }
    this.readers = readers;
  }
  /*@Override*/
  reset() {
    if (this.readers !== null) {
      for (const reader of this.readers) {
        reader.reset();
      }
    }
  }
  /**
   * @throws NotFoundException
   */
  decodeInternal(image) {
    if (this.readers === null) {
      throw new ReaderException.ReaderException("No readers where selected, nothing can be read.");
    }
    for (const reader of this.readers) {
      try {
        return reader.decode(image, this.hints);
      } catch (ex) {
        if (ex instanceof ReaderException.ReaderException) {
          continue;
        }
        console.warn("MultiFormatReader: non-ReaderException from reader:", ex);
        continue;
      }
    }
    throw new NotFoundException.NotFoundException("No MultiFormat Readers were able to detect the code.");
  }
}

exports.MultiFormatReader = MultiFormatReader;
//# sourceMappingURL=MultiFormatReader.cjs.map
//# sourceMappingURL=MultiFormatReader.cjs.map