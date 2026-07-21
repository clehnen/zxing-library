import { ChecksumException } from '../../ChecksumException';
import { BitMatrix } from '../../common/BitMatrix';
import { GenericGF } from '../../common/reedsolomon/GenericGF';
import { ReedSolomonDecoder } from '../../common/reedsolomon/ReedSolomonDecoder';
import { BitMatrixParser } from './BitMatrixParser';
import { DataBlock } from './DataBlock';
import { QRCodeDecodedBitStreamParser } from './QRCodeDecodedBitStreamParser';
import { QRCodeDecoderMetaData } from './QRCodeDecoderMetaData';

class Decoder {
  rsDecoder;
  constructor() {
    this.rsDecoder = new ReedSolomonDecoder(GenericGF.QR_CODE_FIELD_256);
  }
  // public decode(image: boolean[][]): DecoderResult /*throws ChecksumException, FormatException*/ {
  //   return decode(image, null)
  // }
  /**
   * <p>Convenience method that can decode a QR Code represented as a 2D array of booleans.
   * "true" is taken to mean a black module.</p>
   *
   * @param image booleans representing white/black QR Code modules
   * @param hints decoding hints that should be used to influence decoding
   * @return text and bytes encoded within the QR Code
   * @throws FormatException if the QR Code cannot be decoded
   * @throws ChecksumException if error correction fails
   */
  decodeBooleanArray(image, hints) {
    return this.decodeBitMatrix(BitMatrix.parseFromBooleanArray(image), hints);
  }
  // public decodeBitMatrix(bits: BitMatrix): DecoderResult /*throws ChecksumException, FormatException*/ {
  //   return decode(bits, null)
  // }
  /**
   * <p>Decodes a QR Code represented as a {@link BitMatrix}. A 1 or "true" is taken to mean a black module.</p>
   *
   * @param bits booleans representing white/black QR Code modules
   * @param hints decoding hints that should be used to influence decoding
   * @return text and bytes encoded within the QR Code
   * @throws FormatException if the QR Code cannot be decoded
   * @throws ChecksumException if error correction fails
   */
  decodeBitMatrix(bits, hints) {
    const parser = new BitMatrixParser(bits);
    let ex = null;
    try {
      return this.decodeBitMatrixParser(parser, hints);
    } catch (e) {
      ex = e;
    }
    try {
      parser.remask();
      parser.setMirror(true);
      parser.readVersion();
      parser.readFormatInformation();
      parser.mirror();
      const result = this.decodeBitMatrixParser(parser, hints);
      result.setOther(new QRCodeDecoderMetaData(true));
      return result;
    } catch (e) {
      if (ex !== null) {
        throw ex;
      }
      throw e;
    }
  }
  decodeBitMatrixParser(parser, hints) {
    const version = parser.readVersion();
    const ecLevel = parser.readFormatInformation().getErrorCorrectionLevel();
    const codewords = parser.readCodewords();
    const dataBlocks = DataBlock.getDataBlocks(codewords, version, ecLevel);
    let totalBytes = 0;
    for (const dataBlock of dataBlocks) {
      totalBytes += dataBlock.getNumDataCodewords();
    }
    const resultBytes = new Uint8Array(totalBytes);
    let resultOffset = 0;
    for (const dataBlock of dataBlocks) {
      const codewordBytes = dataBlock.getCodewords();
      const numDataCodewords = dataBlock.getNumDataCodewords();
      this.correctErrors(codewordBytes, numDataCodewords);
      for (let i = 0; i < numDataCodewords; i++) {
        resultBytes[resultOffset++] = codewordBytes[i];
      }
    }
    return QRCodeDecodedBitStreamParser.decode(resultBytes, version, ecLevel, hints);
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
      throw new ChecksumException();
    }
    for (let i = 0; i < numDataCodewords; i++) {
      codewordBytes[i] = /*(byte) */
      codewordsInts[i];
    }
  }
}

export { Decoder };
//# sourceMappingURL=Decoder.js.map
//# sourceMappingURL=Decoder.js.map