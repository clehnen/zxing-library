'use strict';

var BarcodeFormat = require('../BarcodeFormat');
var DecodeHintType = require('../DecodeHintType');
var NotFoundException = require('../NotFoundException');
var Code128Reader = require('./Code128Reader');
var Code39Reader = require('./Code39Reader');
var Code93Reader = require('./Code93Reader');
var ITFReader = require('./ITFReader');
var MultiFormatUPCEANReader = require('./MultiFormatUPCEANReader');
var OneDReader = require('./OneDReader');
var CodaBarReader = require('./CodaBarReader');
var RSSExpandedReader = require('./rss/expanded/RSSExpandedReader');
var RSS14Reader = require('./rss/RSS14Reader');

class MultiFormatOneDReader extends OneDReader.OneDReader {
  readers = [];
  constructor(hints) {
    super();
    const possibleFormats = !hints ? null : hints.get(DecodeHintType.DecodeHintType.POSSIBLE_FORMATS);
    const useCode39CheckDigit = hints && hints.get(DecodeHintType.DecodeHintType.ASSUME_CODE_39_CHECK_DIGIT) !== void 0;
    const useCode39ExtendedMode = hints && hints.get(DecodeHintType.DecodeHintType.ENABLE_CODE_39_EXTENDED_MODE) !== void 0;
    if (possibleFormats) {
      if (possibleFormats.includes(BarcodeFormat.BarcodeFormat.EAN_13) || possibleFormats.includes(BarcodeFormat.BarcodeFormat.UPC_A) || possibleFormats.includes(BarcodeFormat.BarcodeFormat.EAN_8) || possibleFormats.includes(BarcodeFormat.BarcodeFormat.UPC_E)) {
        this.readers.push(new MultiFormatUPCEANReader.MultiFormatUPCEANReader(hints));
      }
      if (possibleFormats.includes(BarcodeFormat.BarcodeFormat.CODE_39)) {
        this.readers.push(new Code39Reader.Code39Reader(useCode39CheckDigit, useCode39ExtendedMode));
      }
      if (possibleFormats.includes(BarcodeFormat.BarcodeFormat.CODE_93)) {
        this.readers.push(new Code93Reader.Code93Reader());
      }
      if (possibleFormats.includes(BarcodeFormat.BarcodeFormat.CODE_128)) {
        this.readers.push(new Code128Reader.Code128Reader());
      }
      if (possibleFormats.includes(BarcodeFormat.BarcodeFormat.ITF)) {
        this.readers.push(new ITFReader.ITFReader());
      }
      if (possibleFormats.includes(BarcodeFormat.BarcodeFormat.CODABAR)) {
        this.readers.push(new CodaBarReader.CodaBarReader());
      }
      if (possibleFormats.includes(BarcodeFormat.BarcodeFormat.RSS_14)) {
        this.readers.push(new RSS14Reader.RSS14Reader());
      }
      if (possibleFormats.includes(BarcodeFormat.BarcodeFormat.RSS_EXPANDED)) {
        console.warn("RSS Expanded reader IS NOT ready for production yet! use at your own risk.");
        this.readers.push(new RSSExpandedReader.RSSExpandedReader());
      }
    }
    if (this.readers.length === 0) {
      this.readers.push(new MultiFormatUPCEANReader.MultiFormatUPCEANReader(hints));
      this.readers.push(new Code39Reader.Code39Reader());
      this.readers.push(new Code93Reader.Code93Reader());
      this.readers.push(new MultiFormatUPCEANReader.MultiFormatUPCEANReader(hints));
      this.readers.push(new Code128Reader.Code128Reader());
      this.readers.push(new ITFReader.ITFReader());
      this.readers.push(new RSS14Reader.RSS14Reader());
      this.readers.push(new RSSExpandedReader.RSSExpandedReader());
    }
  }
  // @Override
  decodeRow(rowNumber, row, hints) {
    for (let i = 0; i < this.readers.length; i++) {
      try {
        return this.readers[i].decodeRow(rowNumber, row, hints);
      } catch (re) {
      }
    }
    throw new NotFoundException.NotFoundException();
  }
  // @Override
  reset() {
    this.readers.forEach((reader) => reader.reset());
  }
}

exports.MultiFormatOneDReader = MultiFormatOneDReader;
//# sourceMappingURL=MultiFormatOneDReader.cjs.map
//# sourceMappingURL=MultiFormatOneDReader.cjs.map