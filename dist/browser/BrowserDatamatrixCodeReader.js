import { BrowserCodeReader } from './BrowserCodeReader';
import { DataMatrixReader } from '../core/datamatrix/DataMatrixReader';

class BrowserDatamatrixCodeReader extends BrowserCodeReader {
  /**
   * Creates an instance of BrowserQRCodeReader.
   * @param {number} [timeBetweenScansMillis=500] the time delay between subsequent decode tries
   */
  constructor(timeBetweenScansMillis = 500) {
    super(new DataMatrixReader(), timeBetweenScansMillis);
  }
}

export { BrowserDatamatrixCodeReader };
//# sourceMappingURL=BrowserDatamatrixCodeReader.js.map
//# sourceMappingURL=BrowserDatamatrixCodeReader.js.map