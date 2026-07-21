'use strict';

var BarcodeFormat = require('../BarcodeFormat');
var DecodeHintType = require('../DecodeHintType');
var Result = require('../Result');
var OneDReader = require('./OneDReader');
var EAN13Reader = require('./EAN13Reader');
var EAN8Reader = require('./EAN8Reader');
var UPCAReader = require('./UPCAReader');
var NotFoundException = require('../NotFoundException');
var UPCEReader = require('./UPCEReader');

class MultiFormatUPCEANReader extends OneDReader.OneDReader {
  readers;
  constructor(hints) {
    super();
    let possibleFormats = hints == null ? null : hints.get(DecodeHintType.DecodeHintType.POSSIBLE_FORMATS);
    let readers = [];
    if (possibleFormats != null) {
      if (possibleFormats.indexOf(BarcodeFormat.BarcodeFormat.EAN_13) > -1) {
        readers.push(new EAN13Reader.EAN13Reader());
      }
      if (possibleFormats.indexOf(BarcodeFormat.BarcodeFormat.UPC_A) > -1) {
        readers.push(new UPCAReader.UPCAReader());
      }
      if (possibleFormats.indexOf(BarcodeFormat.BarcodeFormat.EAN_8) > -1) {
        readers.push(new EAN8Reader.EAN8Reader());
      }
      if (possibleFormats.indexOf(BarcodeFormat.BarcodeFormat.UPC_E) > -1) {
        readers.push(new UPCEReader.UPCEReader());
      }
    }
    if (readers.length === 0) {
      readers.push(new EAN13Reader.EAN13Reader());
      readers.push(new UPCAReader.UPCAReader());
      readers.push(new EAN8Reader.EAN8Reader());
      readers.push(new UPCEReader.UPCEReader());
    }
    this.readers = readers;
  }
  decodeRow(rowNumber, row, hints) {
    for (let reader of this.readers) {
      try {
        const result = reader.decodeRow(rowNumber, row, hints);
        const ean13MayBeUPCA = result.getBarcodeFormat() === BarcodeFormat.BarcodeFormat.EAN_13 && result.getText().charAt(0) === "0";
        const possibleFormats = hints == null ? null : hints.get(DecodeHintType.DecodeHintType.POSSIBLE_FORMATS);
        const canReturnUPCA = possibleFormats == null || possibleFormats.includes(BarcodeFormat.BarcodeFormat.UPC_A);
        if (ean13MayBeUPCA && canReturnUPCA) {
          const rawBytes = result.getRawBytes();
          const resultUPCA = new Result.Result(
            result.getText().substring(1),
            rawBytes,
            rawBytes ? rawBytes.length : null,
            result.getResultPoints(),
            BarcodeFormat.BarcodeFormat.UPC_A
          );
          resultUPCA.putAllMetadata(result.getResultMetadata());
          return resultUPCA;
        }
        return result;
      } catch (err) {
      }
    }
    throw new NotFoundException.NotFoundException();
  }
  reset() {
    for (let reader of this.readers) {
      reader.reset();
    }
  }
}

exports.MultiFormatUPCEANReader = MultiFormatUPCEANReader;
//# sourceMappingURL=MultiFormatUPCEANReader.cjs.map
//# sourceMappingURL=MultiFormatUPCEANReader.cjs.map