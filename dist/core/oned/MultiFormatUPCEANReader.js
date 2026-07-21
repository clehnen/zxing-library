import { BarcodeFormat } from '../BarcodeFormat';
import { DecodeHintType } from '../DecodeHintType';
import { Result } from '../Result';
import { OneDReader } from './OneDReader';
import { EAN13Reader } from './EAN13Reader';
import { EAN8Reader } from './EAN8Reader';
import { UPCAReader } from './UPCAReader';
import { NotFoundException } from '../NotFoundException';
import { UPCEReader } from './UPCEReader';

class MultiFormatUPCEANReader extends OneDReader {
  readers;
  constructor(hints) {
    super();
    let possibleFormats = hints == null ? null : hints.get(DecodeHintType.POSSIBLE_FORMATS);
    let readers = [];
    if (possibleFormats != null) {
      if (possibleFormats.indexOf(BarcodeFormat.EAN_13) > -1) {
        readers.push(new EAN13Reader());
      }
      if (possibleFormats.indexOf(BarcodeFormat.UPC_A) > -1) {
        readers.push(new UPCAReader());
      }
      if (possibleFormats.indexOf(BarcodeFormat.EAN_8) > -1) {
        readers.push(new EAN8Reader());
      }
      if (possibleFormats.indexOf(BarcodeFormat.UPC_E) > -1) {
        readers.push(new UPCEReader());
      }
    }
    if (readers.length === 0) {
      readers.push(new EAN13Reader());
      readers.push(new UPCAReader());
      readers.push(new EAN8Reader());
      readers.push(new UPCEReader());
    }
    this.readers = readers;
  }
  decodeRow(rowNumber, row, hints) {
    for (let reader of this.readers) {
      try {
        const result = reader.decodeRow(rowNumber, row, hints);
        const ean13MayBeUPCA = result.getBarcodeFormat() === BarcodeFormat.EAN_13 && result.getText().charAt(0) === "0";
        const possibleFormats = hints == null ? null : hints.get(DecodeHintType.POSSIBLE_FORMATS);
        const canReturnUPCA = possibleFormats == null || possibleFormats.includes(BarcodeFormat.UPC_A);
        if (ean13MayBeUPCA && canReturnUPCA) {
          const rawBytes = result.getRawBytes();
          const resultUPCA = new Result(
            result.getText().substring(1),
            rawBytes,
            rawBytes ? rawBytes.length : null,
            result.getResultPoints(),
            BarcodeFormat.UPC_A
          );
          resultUPCA.putAllMetadata(result.getResultMetadata());
          return resultUPCA;
        }
        return result;
      } catch (err) {
      }
    }
    throw new NotFoundException();
  }
  reset() {
    for (let reader of this.readers) {
      reader.reset();
    }
  }
}

export { MultiFormatUPCEANReader };
//# sourceMappingURL=MultiFormatUPCEANReader.js.map
//# sourceMappingURL=MultiFormatUPCEANReader.js.map