import { ChecksumException } from '../../ChecksumException';
import { GenericGF } from '../../common/reedsolomon/GenericGF';
import { ReedSolomonDecoder } from '../../common/reedsolomon/ReedSolomonDecoder';
import { MicroQRBitMatrixParser } from './MicroQRBitMatrixParser';
import { MicroQRDecodedBitStreamParser } from './MicroQRDecodedBitStreamParser';
import { MicroQRVersion } from './MicroQRVersion';

class MicroQRDecoder {
  rsDecoder;
  constructor() {
    this.rsDecoder = new ReedSolomonDecoder(GenericGF.QR_CODE_FIELD_256);
  }
  decodeBitMatrix(bits, hints) {
    const parser = new MicroQRBitMatrixParser(bits);
    const formatInfo = parser.readFormatInformation();
    const version = MicroQRVersion.getVersionForIndicator(formatInfo.getVersionIndicator());
    const codewords = parser.readCodewords();
    const numDataCodewords = version.getNumDataCodewords();
    version.getNumECCodewords();
    if (version.getVersionNumber() === 1) {
      return MicroQRDecodedBitStreamParser.decode(
        codewords.subarray(0, numDataCodewords),
        version,
        hints ?? null
      );
    }
    this.correctErrors(codewords, numDataCodewords);
    return MicroQRDecodedBitStreamParser.decode(
      codewords.subarray(0, numDataCodewords),
      version,
      hints ?? null
    );
  }
  correctErrors(codewords, numDataCodewords) {
    const codewordsInts = new Int32Array(codewords);
    try {
      this.rsDecoder.decode(codewordsInts, codewords.length - numDataCodewords);
    } catch (e) {
      throw new ChecksumException();
    }
    for (let i = 0; i < numDataCodewords; i++) {
      codewords[i] = codewordsInts[i] & 255;
    }
  }
}

export { MicroQRDecoder };
//# sourceMappingURL=MicroQRDecoder.js.map
//# sourceMappingURL=MicroQRDecoder.js.map