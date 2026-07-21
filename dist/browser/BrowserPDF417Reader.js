import { BrowserCodeReader } from './BrowserCodeReader';
import { PDF417Reader } from '../core/pdf417/PDF417Reader';

class BrowserPDF417Reader extends BrowserCodeReader {
  /**
   * Creates an instance of BrowserPDF417Reader.
   * @param {number} [timeBetweenScansMillis=500] the time delay between subsequent decode tries
   */
  constructor(timeBetweenScansMillis = 500) {
    super(new PDF417Reader(), timeBetweenScansMillis);
  }
}

export { BrowserPDF417Reader };
//# sourceMappingURL=BrowserPDF417Reader.js.map
//# sourceMappingURL=BrowserPDF417Reader.js.map