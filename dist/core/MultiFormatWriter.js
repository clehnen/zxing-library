import { QRCodeWriter } from './qrcode/QRCodeWriter';
import { BarcodeFormat } from './BarcodeFormat';
import { IllegalArgumentException } from './IllegalArgumentException';

class MultiFormatWriter {
  /*@Override*/
  // public encode(contents: string,
  //                         format: BarcodeFormat,
  //                         width: number /*int*/,
  //                         height: number /*int*/): BitMatrix /*throws WriterException */ {
  //   return encode(contents, format, width, height, null)
  // }
  /*@Override*/
  encode(contents, format, width, height, hints) {
    let writer;
    switch (format) {
      // case BarcodeFormat.EAN_8:
      //   writer = new EAN8Writer()
      //   break
      // case BarcodeFormat.UPC_E:
      //   writer = new UPCEWriter()
      //   break
      // case BarcodeFormat.EAN_13:
      //   writer = new EAN13Writer()
      //   break
      // case BarcodeFormat.UPC_A:
      //   writer = new UPCAWriter()
      //   break
      case BarcodeFormat.QR_CODE:
        writer = new QRCodeWriter();
        break;
      // case BarcodeFormat.CODE_39:
      //   writer = new Code39Writer()
      //   break
      // case BarcodeFormat.CODE_93:
      //   writer = new Code93Writer()
      //   break
      // case BarcodeFormat.CODE_128:
      //   writer = new Code128Writer()
      //   break
      // case BarcodeFormat.ITF:
      //   writer = new ITFWriter()
      //   break
      // case BarcodeFormat.PDF_417:
      //   writer = new PDF417Writer()
      //   break
      // case BarcodeFormat.CODABAR:
      //   writer = new CodaBarWriter()
      //   break
      // case BarcodeFormat.DATA_MATRIX:
      //   writer = new DataMatrixWriter()
      //   break
      // case BarcodeFormat.AZTEC:
      //   writer = new AztecWriter()
      //   break
      default:
        throw new IllegalArgumentException("No encoder available for format " + format);
    }
    return writer.encode(contents, format, width, height, hints);
  }
}

export { MultiFormatWriter };
//# sourceMappingURL=MultiFormatWriter.js.map
//# sourceMappingURL=MultiFormatWriter.js.map