import { GenericGF } from '../../common/reedsolomon/GenericGF';
import { ReedSolomonDecoder } from '../../common/reedsolomon/ReedSolomonDecoder';
import { ReedSolomonException } from '../../ReedSolomonException';
import { ChecksumException } from '../../ChecksumException';
import { FormatException } from '../../FormatException';
import { BitMatrixParser } from './BitMatrixParser';
import { MaxiCodeDecodedBitStreamParser } from './MaxiCodeDecodedBitStreamParser';

class MaxiCodeDecoder {
  static ALL = 0;
  static EVEN = 1;
  static ODD = 2;
  rsDecoder;
  constructor() {
    this.rsDecoder = new ReedSolomonDecoder(GenericGF.MAXICODE_FIELD_64);
  }
  decode(bits, hints) {
    const parser = new BitMatrixParser(bits);
    const codewords = parser.readCodewords();
    let errorsCorrected = this.correctErrors(codewords, 0, 10, 10, MaxiCodeDecoder.ALL);
    const mode = codewords[0] & 15;
    let datawords;
    switch (mode) {
      case 2:
      case 3:
      case 4:
        errorsCorrected += this.correctErrors(codewords, 20, 84, 40, MaxiCodeDecoder.EVEN);
        errorsCorrected += this.correctErrors(codewords, 20, 84, 40, MaxiCodeDecoder.ODD);
        datawords = new Uint8Array(94);
        break;
      case 5:
        errorsCorrected += this.correctErrors(codewords, 20, 68, 56, MaxiCodeDecoder.EVEN);
        errorsCorrected += this.correctErrors(codewords, 20, 68, 56, MaxiCodeDecoder.ODD);
        datawords = new Uint8Array(78);
        break;
      default:
        throw FormatException.getFormatInstance();
    }
    for (let i = 0; i < 10; i++) {
      datawords[i] = codewords[i];
    }
    for (let i = 0; i < datawords.length - 10; i++) {
      datawords[i + 10] = codewords[i + 20];
    }
    const result = MaxiCodeDecodedBitStreamParser.decode(datawords, mode);
    result.setErrorsCorrected(errorsCorrected);
    return result;
  }
  correctErrors(codewordBytes, start, dataCodewords, ecCodewords, mode) {
    const codewords = dataCodewords + ecCodewords;
    const divisor = mode === MaxiCodeDecoder.ALL ? 1 : 2;
    const codewordsInts = new Int32Array(Math.floor(codewords / divisor));
    for (let i = 0; i < codewords; i++) {
      if (mode === MaxiCodeDecoder.ALL || i % 2 === mode - 1) {
        codewordsInts[Math.floor(i / divisor)] = codewordBytes[i + start] & 255;
      }
    }
    let errorsCorrected = 0;
    try {
      errorsCorrected = this.rsDecoder.decodeWithECCount(codewordsInts, Math.floor(ecCodewords / divisor));
    } catch (ex) {
      if (ex instanceof ReedSolomonException) {
        throw ChecksumException.getChecksumInstance();
      }
      throw ex;
    }
    for (let i = 0; i < dataCodewords; i++) {
      if (mode === MaxiCodeDecoder.ALL || i % 2 === mode - 1) {
        codewordBytes[i + start] = codewordsInts[Math.floor(i / divisor)];
      }
    }
    return errorsCorrected;
  }
}

export { MaxiCodeDecoder };
//# sourceMappingURL=MaxiCodeDecoder.js.map
//# sourceMappingURL=MaxiCodeDecoder.js.map