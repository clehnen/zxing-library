import { BarcodeFormat } from '../BarcodeFormat';
import { Result } from '../Result';
import { NotFoundException } from '../NotFoundException';
import { EAN13Reader } from './EAN13Reader';
import { UPCEANReader } from './UPCEANReader';

class UPCAReader extends UPCEANReader {
  ean13Reader = new EAN13Reader();
  // @Override
  getBarcodeFormat() {
    return BarcodeFormat.UPC_A;
  }
  // Note that we don't try rotation without the try harder flag, even if rotation was supported.
  // @Override
  decode(image, hints) {
    return this.maybeReturnResult(this.ean13Reader.decode(image));
  }
  // @Override
  decodeRow(rowNumber, row, hints) {
    return this.maybeReturnResult(this.ean13Reader.decodeRow(rowNumber, row, hints));
  }
  // @Override
  decodeMiddle(row, startRange, resultString) {
    return this.ean13Reader.decodeMiddle(row, startRange, resultString);
  }
  maybeReturnResult(result) {
    let text = result.getText();
    if (text.charAt(0) === "0") {
      let upcaResult = new Result(text.substring(1), null, null, result.getResultPoints(), BarcodeFormat.UPC_A);
      if (result.getResultMetadata() != null) {
        upcaResult.putAllMetadata(result.getResultMetadata());
      }
      return upcaResult;
    } else {
      throw new NotFoundException();
    }
  }
  reset() {
    this.ean13Reader.reset();
  }
}

export { UPCAReader };
//# sourceMappingURL=UPCAReader.js.map
//# sourceMappingURL=UPCAReader.js.map