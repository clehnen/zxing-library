import { BrowserCodeReader } from './BrowserCodeReader';
import { MultiFormatReader } from '../core/MultiFormatReader';

class BrowserMultiFormatReader extends BrowserCodeReader {
  set hints(hints) {
    this._hints = hints || null;
    this.reader.setHints(hints);
  }
  constructor(hints = null, timeBetweenScansMillis = 500) {
    const reader = new MultiFormatReader();
    reader.setHints(hints);
    super(reader, timeBetweenScansMillis);
  }
  /**
   * Overwrite decodeBitmap to call decodeWithState, which will pay
   * attention to the hints set in the constructor function
   */
  decodeBitmap(binaryBitmap) {
    try {
      return this.reader.decodeWithState(binaryBitmap);
    } finally {
      this.reader.reset();
    }
  }
}

export { BrowserMultiFormatReader };
//# sourceMappingURL=BrowserMultiFormatReader.js.map
//# sourceMappingURL=BrowserMultiFormatReader.js.map