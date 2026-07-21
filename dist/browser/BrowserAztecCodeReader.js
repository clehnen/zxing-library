import { BrowserCodeReader } from './BrowserCodeReader';
import { AztecCodeReader } from '../core/aztec/AztecCodeReader';

class BrowserAztecCodeReader extends BrowserCodeReader {
  /**
   * Creates an instance of BrowserAztecCodeReader.
   * @param {number} [timeBetweenScansMillis=500] the time delay between subsequent decode tries
   *
   * @memberOf BrowserAztecCodeReader
   */
  constructor(timeBetweenScansMillis = 500) {
    super(new AztecCodeReader(), timeBetweenScansMillis);
  }
}

export { BrowserAztecCodeReader };
//# sourceMappingURL=BrowserAztecCodeReader.js.map
//# sourceMappingURL=BrowserAztecCodeReader.js.map