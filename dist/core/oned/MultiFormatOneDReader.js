import { BarcodeFormat } from '../BarcodeFormat';
import { DecodeHintType } from '../DecodeHintType';
import { NotFoundException } from '../NotFoundException';
import { Code128Reader } from './Code128Reader';
import { Code39Reader } from './Code39Reader';
import { Code93Reader } from './Code93Reader';
import { ITFReader } from './ITFReader';
import { MultiFormatUPCEANReader } from './MultiFormatUPCEANReader';
import { OneDReader } from './OneDReader';
import { CodaBarReader } from './CodaBarReader';
import { RSSExpandedReader } from './rss/expanded/RSSExpandedReader';
import { RSS14Reader } from './rss/RSS14Reader';

class MultiFormatOneDReader extends OneDReader {
  readers = [];
  constructor(hints) {
    super();
    const possibleFormats = !hints ? null : hints.get(DecodeHintType.POSSIBLE_FORMATS);
    const useCode39CheckDigit = hints && hints.get(DecodeHintType.ASSUME_CODE_39_CHECK_DIGIT) !== void 0;
    const useCode39ExtendedMode = hints && hints.get(DecodeHintType.ENABLE_CODE_39_EXTENDED_MODE) !== void 0;
    if (possibleFormats) {
      if (possibleFormats.includes(BarcodeFormat.EAN_13) || possibleFormats.includes(BarcodeFormat.UPC_A) || possibleFormats.includes(BarcodeFormat.EAN_8) || possibleFormats.includes(BarcodeFormat.UPC_E)) {
        this.readers.push(new MultiFormatUPCEANReader(hints));
      }
      if (possibleFormats.includes(BarcodeFormat.CODE_39)) {
        this.readers.push(new Code39Reader(useCode39CheckDigit, useCode39ExtendedMode));
      }
      if (possibleFormats.includes(BarcodeFormat.CODE_93)) {
        this.readers.push(new Code93Reader());
      }
      if (possibleFormats.includes(BarcodeFormat.CODE_128)) {
        this.readers.push(new Code128Reader());
      }
      if (possibleFormats.includes(BarcodeFormat.ITF)) {
        this.readers.push(new ITFReader());
      }
      if (possibleFormats.includes(BarcodeFormat.CODABAR)) {
        this.readers.push(new CodaBarReader());
      }
      if (possibleFormats.includes(BarcodeFormat.RSS_14)) {
        this.readers.push(new RSS14Reader());
      }
      if (possibleFormats.includes(BarcodeFormat.RSS_EXPANDED)) {
        console.warn("RSS Expanded reader IS NOT ready for production yet! use at your own risk.");
        this.readers.push(new RSSExpandedReader());
      }
    }
    if (this.readers.length === 0) {
      this.readers.push(new MultiFormatUPCEANReader(hints));
      this.readers.push(new Code39Reader());
      this.readers.push(new Code93Reader());
      this.readers.push(new MultiFormatUPCEANReader(hints));
      this.readers.push(new Code128Reader());
      this.readers.push(new ITFReader());
      this.readers.push(new RSS14Reader());
      this.readers.push(new RSSExpandedReader());
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
    throw new NotFoundException();
  }
  // @Override
  reset() {
    this.readers.forEach((reader) => reader.reset());
  }
}

export { MultiFormatOneDReader };
//# sourceMappingURL=MultiFormatOneDReader.js.map
//# sourceMappingURL=MultiFormatOneDReader.js.map