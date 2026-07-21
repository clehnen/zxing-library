import { BitArray } from '../../common/BitArray';
import { IllegalArgumentException } from '../../IllegalArgumentException';
import { StringUtils } from '../../common/StringUtils';
import { BitMatrix } from '../../common/BitMatrix';
import { AztecCode } from './AztecCode';
import { ReedSolomonEncoder } from '../../common/reedsolomon/ReedSolomonEncoder';
import { GenericGF } from '../../common/reedsolomon/GenericGF';
import { AztecHighLevelEncoder } from './AztecHighLevelEncoder';
import { ZXingInteger } from '../../util/ZXingInteger';

class AztecEncoder {
  static DEFAULT_EC_PERCENT = 33;
  // default minimal percentage of error check words
  static DEFAULT_AZTEC_LAYERS = 0;
  static MAX_NB_BITS = 32;
  static MAX_NB_BITS_COMPACT = 4;
  static WORD_SIZE = Int32Array.from([
    4,
    6,
    6,
    8,
    8,
    8,
    8,
    8,
    8,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    12,
    12,
    12,
    12,
    12,
    12,
    12,
    12,
    12,
    12
  ]);
  constructor() {
  }
  /**
   * Encodes the given binary content as an Aztec symbol
   *
   * @param data input data string
   * @return Aztec symbol matrix with metadata
   */
  static encodeBytes(data) {
    return AztecEncoder.encode(data, AztecEncoder.DEFAULT_EC_PERCENT, AztecEncoder.DEFAULT_AZTEC_LAYERS);
  }
  /**
   * Encodes the given binary content as an Aztec symbol
   *
   * @param data input data string
   * @param minECCPercent minimal percentage of error check words (According to ISO/IEC 24778:2008,
   *                      a minimum of 23% + 3 words is recommended)
   * @param userSpecifiedLayers if non-zero, a user-specified value for the number of layers
   * @return Aztec symbol matrix with metadata
   */
  static encode(data, minECCPercent, userSpecifiedLayers) {
    let bits = new AztecHighLevelEncoder(data).encode();
    let eccBits = ZXingInteger.truncDivision(bits.getSize() * minECCPercent, 100) + 11;
    let totalSizeBits = bits.getSize() + eccBits;
    let compact;
    let layers;
    let totalBitsInLayer;
    let wordSize;
    let stuffedBits;
    if (userSpecifiedLayers !== AztecEncoder.DEFAULT_AZTEC_LAYERS) {
      compact = userSpecifiedLayers < 0;
      layers = Math.abs(userSpecifiedLayers);
      if (layers > (compact ? AztecEncoder.MAX_NB_BITS_COMPACT : AztecEncoder.MAX_NB_BITS)) {
        throw new IllegalArgumentException(
          StringUtils.format("Illegal value %s for layers", userSpecifiedLayers)
        );
      }
      totalBitsInLayer = AztecEncoder.totalBitsInLayer(layers, compact);
      wordSize = AztecEncoder.WORD_SIZE[layers];
      let usableBitsInLayers = totalBitsInLayer - totalBitsInLayer % wordSize;
      stuffedBits = AztecEncoder.stuffBits(bits, wordSize);
      if (stuffedBits.getSize() + eccBits > usableBitsInLayers) {
        throw new IllegalArgumentException("Data to large for user specified layer");
      }
      if (compact && stuffedBits.getSize() > wordSize * 64) {
        throw new IllegalArgumentException("Data to large for user specified layer");
      }
    } else {
      wordSize = 0;
      stuffedBits = null;
      for (let i = 0; ; i++) {
        if (i > AztecEncoder.MAX_NB_BITS) {
          throw new IllegalArgumentException("Data too large for an Aztec code");
        }
        compact = i <= 3;
        layers = compact ? i + 1 : i;
        totalBitsInLayer = AztecEncoder.totalBitsInLayer(layers, compact);
        if (totalSizeBits > totalBitsInLayer) {
          continue;
        }
        if (stuffedBits == null || wordSize !== AztecEncoder.WORD_SIZE[layers]) {
          wordSize = AztecEncoder.WORD_SIZE[layers];
          stuffedBits = AztecEncoder.stuffBits(bits, wordSize);
        }
        let usableBitsInLayers = totalBitsInLayer - totalBitsInLayer % wordSize;
        if (compact && stuffedBits.getSize() > wordSize * 64) {
          continue;
        }
        if (stuffedBits.getSize() + eccBits <= usableBitsInLayers) {
          break;
        }
      }
    }
    let messageBits = AztecEncoder.generateCheckWords(stuffedBits, totalBitsInLayer, wordSize);
    let messageSizeInWords = stuffedBits.getSize() / wordSize;
    let modeMessage = AztecEncoder.generateModeMessage(compact, layers, messageSizeInWords);
    let baseMatrixSize = (compact ? 11 : 14) + layers * 4;
    let alignmentMap = new Int32Array(baseMatrixSize);
    let matrixSize;
    if (compact) {
      matrixSize = baseMatrixSize;
      for (let i = 0; i < alignmentMap.length; i++) {
        alignmentMap[i] = i;
      }
    } else {
      matrixSize = baseMatrixSize + 1 + 2 * ZXingInteger.truncDivision(ZXingInteger.truncDivision(baseMatrixSize, 2) - 1, 15);
      let origCenter = ZXingInteger.truncDivision(baseMatrixSize, 2);
      let center = ZXingInteger.truncDivision(matrixSize, 2);
      for (let i = 0; i < origCenter; i++) {
        let newOffset = i + ZXingInteger.truncDivision(i, 15);
        alignmentMap[origCenter - i - 1] = center - newOffset - 1;
        alignmentMap[origCenter + i] = center + newOffset + 1;
      }
    }
    let matrix = new BitMatrix(matrixSize);
    for (let i = 0, rowOffset = 0; i < layers; i++) {
      let rowSize = (layers - i) * 4 + (compact ? 9 : 12);
      for (let j = 0; j < rowSize; j++) {
        let columnOffset = j * 2;
        for (let k = 0; k < 2; k++) {
          if (messageBits.get(rowOffset + columnOffset + k)) {
            matrix.set(alignmentMap[i * 2 + k], alignmentMap[i * 2 + j]);
          }
          if (messageBits.get(rowOffset + rowSize * 2 + columnOffset + k)) {
            matrix.set(alignmentMap[i * 2 + j], alignmentMap[baseMatrixSize - 1 - i * 2 - k]);
          }
          if (messageBits.get(rowOffset + rowSize * 4 + columnOffset + k)) {
            matrix.set(alignmentMap[baseMatrixSize - 1 - i * 2 - k], alignmentMap[baseMatrixSize - 1 - i * 2 - j]);
          }
          if (messageBits.get(rowOffset + rowSize * 6 + columnOffset + k)) {
            matrix.set(alignmentMap[baseMatrixSize - 1 - i * 2 - j], alignmentMap[i * 2 + k]);
          }
        }
      }
      rowOffset += rowSize * 8;
    }
    AztecEncoder.drawModeMessage(matrix, compact, matrixSize, modeMessage);
    if (compact) {
      AztecEncoder.drawBullsEye(matrix, ZXingInteger.truncDivision(matrixSize, 2), 5);
    } else {
      AztecEncoder.drawBullsEye(matrix, ZXingInteger.truncDivision(matrixSize, 2), 7);
      for (let i = 0, j = 0; i < ZXingInteger.truncDivision(baseMatrixSize, 2) - 1; i += 15, j += 16) {
        for (let k = ZXingInteger.truncDivision(matrixSize, 2) & 1; k < matrixSize; k += 2) {
          matrix.set(ZXingInteger.truncDivision(matrixSize, 2) - j, k);
          matrix.set(ZXingInteger.truncDivision(matrixSize, 2) + j, k);
          matrix.set(k, ZXingInteger.truncDivision(matrixSize, 2) - j);
          matrix.set(k, ZXingInteger.truncDivision(matrixSize, 2) + j);
        }
      }
    }
    let aztec = new AztecCode();
    aztec.setCompact(compact);
    aztec.setSize(matrixSize);
    aztec.setLayers(layers);
    aztec.setCodeWords(messageSizeInWords);
    aztec.setMatrix(matrix);
    return aztec;
  }
  static drawBullsEye(matrix, center, size) {
    for (let i = 0; i < size; i += 2) {
      for (let j = center - i; j <= center + i; j++) {
        matrix.set(j, center - i);
        matrix.set(j, center + i);
        matrix.set(center - i, j);
        matrix.set(center + i, j);
      }
    }
    matrix.set(center - size, center - size);
    matrix.set(center - size + 1, center - size);
    matrix.set(center - size, center - size + 1);
    matrix.set(center + size, center - size);
    matrix.set(center + size, center - size + 1);
    matrix.set(center + size, center + size - 1);
  }
  static generateModeMessage(compact, layers, messageSizeInWords) {
    let modeMessage = new BitArray();
    if (compact) {
      modeMessage.appendBits(layers - 1, 2);
      modeMessage.appendBits(messageSizeInWords - 1, 6);
      modeMessage = AztecEncoder.generateCheckWords(modeMessage, 28, 4);
    } else {
      modeMessage.appendBits(layers - 1, 5);
      modeMessage.appendBits(messageSizeInWords - 1, 11);
      modeMessage = AztecEncoder.generateCheckWords(modeMessage, 40, 4);
    }
    return modeMessage;
  }
  static drawModeMessage(matrix, compact, matrixSize, modeMessage) {
    let center = ZXingInteger.truncDivision(matrixSize, 2);
    if (compact) {
      for (let i = 0; i < 7; i++) {
        let offset = center - 3 + i;
        if (modeMessage.get(i)) {
          matrix.set(offset, center - 5);
        }
        if (modeMessage.get(i + 7)) {
          matrix.set(center + 5, offset);
        }
        if (modeMessage.get(20 - i)) {
          matrix.set(offset, center + 5);
        }
        if (modeMessage.get(27 - i)) {
          matrix.set(center - 5, offset);
        }
      }
    } else {
      for (let i = 0; i < 10; i++) {
        let offset = center - 5 + i + ZXingInteger.truncDivision(i, 5);
        if (modeMessage.get(i)) {
          matrix.set(offset, center - 7);
        }
        if (modeMessage.get(i + 10)) {
          matrix.set(center + 7, offset);
        }
        if (modeMessage.get(29 - i)) {
          matrix.set(offset, center + 7);
        }
        if (modeMessage.get(39 - i)) {
          matrix.set(center - 7, offset);
        }
      }
    }
  }
  static generateCheckWords(bitArray, totalBits, wordSize) {
    let messageSizeInWords = bitArray.getSize() / wordSize;
    let rs = new ReedSolomonEncoder(AztecEncoder.getGF(wordSize));
    let totalWords = ZXingInteger.truncDivision(totalBits, wordSize);
    let messageWords = AztecEncoder.bitsToWords(bitArray, wordSize, totalWords);
    rs.encode(messageWords, totalWords - messageSizeInWords);
    let startPad = totalBits % wordSize;
    let messageBits = new BitArray();
    messageBits.appendBits(0, startPad);
    for (const messageWord of Array.from(messageWords)) {
      messageBits.appendBits(messageWord, wordSize);
    }
    return messageBits;
  }
  static bitsToWords(stuffedBits, wordSize, totalWords) {
    let message = new Int32Array(totalWords);
    let i;
    let n;
    for (i = 0, n = stuffedBits.getSize() / wordSize; i < n; i++) {
      let value = 0;
      for (let j = 0; j < wordSize; j++) {
        value |= stuffedBits.get(i * wordSize + j) ? 1 << wordSize - j - 1 : 0;
      }
      message[i] = value;
    }
    return message;
  }
  static getGF(wordSize) {
    switch (wordSize) {
      case 4:
        return GenericGF.AZTEC_PARAM;
      case 6:
        return GenericGF.AZTEC_DATA_6;
      case 8:
        return GenericGF.AZTEC_DATA_8;
      case 10:
        return GenericGF.AZTEC_DATA_10;
      case 12:
        return GenericGF.AZTEC_DATA_12;
      default:
        throw new IllegalArgumentException("Unsupported word size " + wordSize);
    }
  }
  static stuffBits(bits, wordSize) {
    let out = new BitArray();
    let n = bits.getSize();
    let mask = (1 << wordSize) - 2;
    for (let i = 0; i < n; i += wordSize) {
      let word = 0;
      for (let j = 0; j < wordSize; j++) {
        if (i + j >= n || bits.get(i + j)) {
          word |= 1 << wordSize - 1 - j;
        }
      }
      if ((word & mask) === mask) {
        out.appendBits(word & mask, wordSize);
        i--;
      } else if ((word & mask) === 0) {
        out.appendBits(word | 1, wordSize);
        i--;
      } else {
        out.appendBits(word, wordSize);
      }
    }
    return out;
  }
  static totalBitsInLayer(layers, compact) {
    return ((compact ? 88 : 112) + 16 * layers) * layers;
  }
}

export { AztecEncoder };
//# sourceMappingURL=AztecEncoder.js.map
//# sourceMappingURL=AztecEncoder.js.map