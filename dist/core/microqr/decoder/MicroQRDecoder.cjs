'use strict';

var ChecksumException = require('../../ChecksumException');
var GenericGF = require('../../common/reedsolomon/GenericGF');
var ReedSolomonDecoder = require('../../common/reedsolomon/ReedSolomonDecoder');
var MicroQRBitMatrixParser = require('./MicroQRBitMatrixParser');
var MicroQRDecodedBitStreamParser = require('./MicroQRDecodedBitStreamParser');
var MicroQRVersion = require('./MicroQRVersion');

class MicroQRDecoder {
  rsDecoder;
  constructor() {
    this.rsDecoder = new ReedSolomonDecoder.ReedSolomonDecoder(GenericGF.GenericGF.QR_CODE_FIELD_256);
  }
  decodeBitMatrix(bits, hints) {
    const parser = new MicroQRBitMatrixParser.MicroQRBitMatrixParser(bits);
    const formatInfo = parser.readFormatInformation();
    const version = MicroQRVersion.MicroQRVersion.getVersionForIndicator(formatInfo.getVersionIndicator());
    const codewords = parser.readCodewords();
    const numDataCodewords = version.getNumDataCodewords();
    version.getNumECCodewords();
    if (version.getVersionNumber() === 1) {
      return MicroQRDecodedBitStreamParser.MicroQRDecodedBitStreamParser.decode(
        codewords.subarray(0, numDataCodewords),
        version,
        hints ?? null
      );
    }
    this.correctErrors(codewords, numDataCodewords);
    return MicroQRDecodedBitStreamParser.MicroQRDecodedBitStreamParser.decode(
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
      throw new ChecksumException.ChecksumException();
    }
    for (let i = 0; i < numDataCodewords; i++) {
      codewords[i] = codewordsInts[i] & 255;
    }
  }
}

exports.MicroQRDecoder = MicroQRDecoder;
//# sourceMappingURL=MicroQRDecoder.cjs.map
//# sourceMappingURL=MicroQRDecoder.cjs.map