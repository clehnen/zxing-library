import { BrowserCodeReader } from './BrowserCodeReader';
import { QRCodeReader } from '../core/qrcode/QRCodeReader';

class BrowserQRCodeReader extends BrowserCodeReader {
  /**
   * Creates an instance of BrowserQRCodeReader.
   * @param {number} [timeBetweenScansMillis=500] the time delay between subsequent decode tries
   */
  constructor(timeBetweenScansMillis = 500) {
    super(new QRCodeReader(), timeBetweenScansMillis);
  }
}

export { BrowserQRCodeReader };
//# sourceMappingURL=BrowserQRCodeReader.js.map
//# sourceMappingURL=BrowserQRCodeReader.js.map