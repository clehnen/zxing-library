'use strict';

var ChecksumException = require('../../ChecksumException');
var GenericGF = require('../../common/reedsolomon/GenericGF');
var ReedSolomonDecoder = require('../../common/reedsolomon/ReedSolomonDecoder');
var BitMatrixParser = require('./BitMatrixParser');
var DataBlock = require('./DataBlock');
var DataMatrixDecodedBitStreamParser = require('./DataMatrixDecodedBitStreamParser');

class Decoder {
  rsDecoder;
  constructor() {
    this.rsDecoder = new ReedSolomonDecoder.ReedSolomonDecoder(GenericGF.GenericGF.DATA_MATRIX_FIELD_256);
  }
  /**
   * <p>Decodes a Data Matrix Code represented as a {@link BitMatrix}. A 1 or "true" is taken
   * to mean a black module.</p>
   *
   * @param bits booleans representing white/black Data Matrix Code modules
   * @return text and bytes encoded within the Data Matrix Code
   * @throws FormatException if the Data Matrix Code cannot be decoded
   * @throws ChecksumException if error correction fails
   */
  decode(bits) {
    const parser = new BitMatrixParser.BitMatrixParser(bits);
    const version = parser.getVersion();
    const codewords = parser.readCodewords();
    const dataBlocks = DataBlock.DataBlock.getDataBlocks(codewords, version);
    let totalBytes = 0;
    for (let db of dataBlocks) {
      totalBytes += db.getNumDataCodewords();
    }
    const resultBytes = new Uint8Array(totalBytes);
    const dataBlocksCount = dataBlocks.length;
    for (let j = 0; j < dataBlocksCount; j++) {
      const dataBlock = dataBlocks[j];
      const codewordBytes = dataBlock.getCodewords();
      const numDataCodewords = dataBlock.getNumDataCodewords();
      this.correctErrors(codewordBytes, numDataCodewords);
      for (let i = 0; i < numDataCodewords; i++) {
        resultBytes[i * dataBlocksCount + j] = codewordBytes[i];
      }
    }
    return DataMatrixDecodedBitStreamParser.DataMatrixDecodedBitStreamParser.decode(resultBytes);
  }
  /**
   * <p>Given data and error-correction codewords received, possibly corrupted by errors, attempts to
   * correct the errors in-place using Reed-Solomon error correction.</p>
   *
   * @param codewordBytes data and error correction codewords
   * @param numDataCodewords number of codewords that are data bytes
   * @throws ChecksumException if error correction fails
   */
  correctErrors(codewordBytes, numDataCodewords) {
    const codewordsInts = new Int32Array(codewordBytes);
    try {
      this.rsDecoder.decode(codewordsInts, codewordBytes.length - numDataCodewords);
    } catch (ignored) {
      throw new ChecksumException.ChecksumException();
    }
    for (let i = 0; i < numDataCodewords; i++) {
      codewordBytes[i] = codewordsInts[i];
    }
  }
}

exports.Decoder = Decoder;
//# sourceMappingURL=Decoder.cjs.map
//# sourceMappingURL=Decoder.cjs.map