import { EncodeHintType } from '../../EncodeHintType';
import { BitArray } from '../../common/BitArray';
import { CharacterSetECI } from '../../common/CharacterSetECI';
import { GenericGF } from '../../common/reedsolomon/GenericGF';
import { ReedSolomonEncoder } from '../../common/reedsolomon/ReedSolomonEncoder';
import { QRCodeMode } from '../decoder/QRCodeMode';
import { QRCodeVersion } from '../decoder/QRCodeVersion';
import { QRCodeMaskUtil } from './QRCodeMaskUtil';
import { QRCodeByteMatrix } from './QRCodeByteMatrix';
import { QRCodeEncoderQRCode } from './QRCodeEncoderQRCode';
import { QRCodeMatrixUtil } from './QRCodeMatrixUtil';
import { ZXingStringEncoding } from '../../util/ZXingStringEncoding';
import { BlockPair } from './BlockPair';
import { WriterException } from '../../WriterException';

class QRCodeEncoder {
  // The original table is defined in the table 5 of JISX0510:2004 (p.19).
  static ALPHANUMERIC_TABLE = Int32Array.from([
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    // 0x00-0x0f
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    // 0x10-0x1f
    36,
    -1,
    -1,
    -1,
    37,
    38,
    -1,
    -1,
    -1,
    -1,
    39,
    40,
    -1,
    41,
    42,
    43,
    // 0x20-0x2f
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    44,
    -1,
    -1,
    -1,
    -1,
    -1,
    // 0x30-0x3f
    -1,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    // 0x40-0x4f
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    -1,
    -1,
    -1,
    -1,
    -1
    // 0x50-0x5f
  ]);
  static DEFAULT_BYTE_MODE_ENCODING = CharacterSetECI.UTF8.getName();
  // "ISO-8859-1"
  // TYPESCRIPTPORT: changed to UTF8, the default for js
  constructor() {
  }
  // The mask penalty calculation is complicated.  See Table 21 of JISX0510:2004 (p.45) for details.
  // Basically it applies four rules and summate all penalties.
  static calculateMaskPenalty(matrix) {
    return QRCodeMaskUtil.applyMaskPenaltyRule1(matrix) + QRCodeMaskUtil.applyMaskPenaltyRule2(matrix) + QRCodeMaskUtil.applyMaskPenaltyRule3(matrix) + QRCodeMaskUtil.applyMaskPenaltyRule4(matrix);
  }
  /**
   * @param content text to encode
   * @param ecLevel error correction level to use
   * @return {@link QRCodeEncoderQRCode} representing the encoded QR code
   * @throws WriterException if encoding can't succeed, because of for example invalid content
   *   or configuration
   */
  // public static encode(content: string, ecLevel: ErrorCorrectionLevel): QRCode /*throws WriterException*/ {
  //   return encode(content, ecLevel, null)
  // }
  static encode(content, ecLevel, hints = null) {
    let encoding = QRCodeEncoder.DEFAULT_BYTE_MODE_ENCODING;
    const hasEncodingHint = hints !== null && void 0 !== hints.get(EncodeHintType.CHARACTER_SET);
    if (hasEncodingHint) {
      encoding = hints.get(EncodeHintType.CHARACTER_SET).toString();
    }
    const mode = this.chooseMode(content, encoding);
    const headerBits = new BitArray();
    if (mode === QRCodeMode.BYTE && (hasEncodingHint || QRCodeEncoder.DEFAULT_BYTE_MODE_ENCODING !== encoding)) {
      const eci = CharacterSetECI.getCharacterSetECIByName(encoding);
      if (eci !== void 0) {
        this.appendECI(eci, headerBits);
      }
    }
    this.appendModeInfo(mode, headerBits);
    const dataBits = new BitArray();
    this.appendBytes(content, mode, dataBits, encoding);
    let version;
    if (hints !== null && void 0 !== hints.get(EncodeHintType.QR_VERSION)) {
      const versionNumber = Number.parseInt(hints.get(EncodeHintType.QR_VERSION).toString(), 10);
      version = QRCodeVersion.getVersionForNumber(versionNumber);
      const bitsNeeded = this.calculateBitsNeeded(mode, headerBits, dataBits, version);
      if (!this.willFit(bitsNeeded, version, ecLevel)) {
        throw new WriterException("Data too big for requested version");
      }
    } else {
      version = this.recommendVersion(ecLevel, mode, headerBits, dataBits);
    }
    const headerAndDataBits = new BitArray();
    headerAndDataBits.appendBitArray(headerBits);
    const numLetters = mode === QRCodeMode.BYTE ? dataBits.getSizeInBytes() : content.length;
    this.appendLengthInfo(numLetters, version, mode, headerAndDataBits);
    headerAndDataBits.appendBitArray(dataBits);
    const ecBlocks = version.getECBlocksForLevel(ecLevel);
    const numDataBytes = version.getTotalCodewords() - ecBlocks.getTotalECCodewords();
    this.terminateBits(numDataBytes, headerAndDataBits);
    const finalBits = this.interleaveWithECBytes(
      headerAndDataBits,
      version.getTotalCodewords(),
      numDataBytes,
      ecBlocks.getNumBlocks()
    );
    const qrCode = new QRCodeEncoderQRCode();
    qrCode.setECLevel(ecLevel);
    qrCode.setMode(mode);
    qrCode.setVersion(version);
    const dimension = version.getDimensionForVersion();
    const matrix = new QRCodeByteMatrix(dimension, dimension);
    const maskPattern = this.chooseMaskPattern(finalBits, ecLevel, version, matrix);
    qrCode.setMaskPattern(maskPattern);
    QRCodeMatrixUtil.buildMatrix(finalBits, ecLevel, version, maskPattern, matrix);
    qrCode.setMatrix(matrix);
    return qrCode;
  }
  /**
   * Decides the smallest version of QR code that will contain all of the provided data.
   *
   * @throws WriterException if the data cannot fit in any version
   */
  static recommendVersion(ecLevel, mode, headerBits, dataBits) {
    const provisionalBitsNeeded = this.calculateBitsNeeded(mode, headerBits, dataBits, QRCodeVersion.getVersionForNumber(1));
    const provisionalVersion = this.chooseVersion(provisionalBitsNeeded, ecLevel);
    const bitsNeeded = this.calculateBitsNeeded(mode, headerBits, dataBits, provisionalVersion);
    return this.chooseVersion(bitsNeeded, ecLevel);
  }
  static calculateBitsNeeded(mode, headerBits, dataBits, version) {
    return headerBits.getSize() + mode.getCharacterCountBits(version) + dataBits.getSize();
  }
  /**
   * @return the code point of the table used in alphanumeric mode or
   *  -1 if there is no corresponding code in the table.
   */
  static getAlphanumericCode(code) {
    if (code < QRCodeEncoder.ALPHANUMERIC_TABLE.length) {
      return QRCodeEncoder.ALPHANUMERIC_TABLE[code];
    }
    return -1;
  }
  // public static chooseMode(content: string): Mode {
  //   return chooseMode(content, null);
  // }
  /**
   * Choose the best mode by examining the content. Note that 'encoding' is used as a hint;
   * if it is Shift_JIS, and the input is only double-byte Kanji, then we return {@link QRCodeMode#KANJI}.
   */
  static chooseMode(content, encoding = null) {
    if (CharacterSetECI.SJIS.getName() === encoding && this.isOnlyDoubleByteKanji(content)) {
      return QRCodeMode.KANJI;
    }
    let hasNumeric = false;
    let hasAlphanumeric = false;
    for (let i = 0, length = content.length; i < length; ++i) {
      const c = content.charAt(i);
      if (QRCodeEncoder.isDigit(c)) {
        hasNumeric = true;
      } else if (this.getAlphanumericCode(c.charCodeAt(0)) !== -1) {
        hasAlphanumeric = true;
      } else {
        return QRCodeMode.BYTE;
      }
    }
    if (hasAlphanumeric) {
      return QRCodeMode.ALPHANUMERIC;
    }
    if (hasNumeric) {
      return QRCodeMode.NUMERIC;
    }
    return QRCodeMode.BYTE;
  }
  static isOnlyDoubleByteKanji(content) {
    let bytes;
    try {
      bytes = ZXingStringEncoding.encode(content, CharacterSetECI.SJIS);
    } catch (ignored) {
      return false;
    }
    const length = bytes.length;
    if (length % 2 !== 0) {
      return false;
    }
    for (let i = 0; i < length; i += 2) {
      const byte1 = bytes[i] & 255;
      if ((byte1 < 129 || byte1 > 159) && (byte1 < 224 || byte1 > 235)) {
        return false;
      }
    }
    return true;
  }
  static chooseMaskPattern(bits, ecLevel, version, matrix) {
    let minPenalty = Number.MAX_SAFE_INTEGER;
    let bestMaskPattern = -1;
    for (let maskPattern = 0; maskPattern < QRCodeEncoderQRCode.NUM_MASK_PATTERNS; maskPattern++) {
      QRCodeMatrixUtil.buildMatrix(bits, ecLevel, version, maskPattern, matrix);
      let penalty = this.calculateMaskPenalty(matrix);
      if (penalty < minPenalty) {
        minPenalty = penalty;
        bestMaskPattern = maskPattern;
      }
    }
    return bestMaskPattern;
  }
  static chooseVersion(numInputBits, ecLevel) {
    for (let versionNum = 1; versionNum <= 40; versionNum++) {
      const version = QRCodeVersion.getVersionForNumber(versionNum);
      if (QRCodeEncoder.willFit(numInputBits, version, ecLevel)) {
        return version;
      }
    }
    throw new WriterException("Data too big");
  }
  /**
   * @return true if the number of input bits will fit in a code with the specified version and
   * error correction level.
   */
  static willFit(numInputBits, version, ecLevel) {
    const numBytes = version.getTotalCodewords();
    const ecBlocks = version.getECBlocksForLevel(ecLevel);
    const numEcBytes = ecBlocks.getTotalECCodewords();
    const numDataBytes = numBytes - numEcBytes;
    const totalInputBytes = (numInputBits + 7) / 8;
    return numDataBytes >= totalInputBytes;
  }
  /**
   * Terminate bits as described in 8.4.8 and 8.4.9 of JISX0510:2004 (p.24).
   */
  static terminateBits(numDataBytes, bits) {
    const capacity = numDataBytes * 8;
    if (bits.getSize() > capacity) {
      throw new WriterException("data bits cannot fit in the QR Code" + bits.getSize() + " > " + capacity);
    }
    for (let i = 0; i < 4 && bits.getSize() < capacity; ++i) {
      bits.appendBit(false);
    }
    const numBitsInLastByte = bits.getSize() & 7;
    if (numBitsInLastByte > 0) {
      for (let i = numBitsInLastByte; i < 8; i++) {
        bits.appendBit(false);
      }
    }
    const numPaddingBytes = numDataBytes - bits.getSizeInBytes();
    for (let i = 0; i < numPaddingBytes; ++i) {
      bits.appendBits((i & 1) === 0 ? 236 : 17, 8);
    }
    if (bits.getSize() !== capacity) {
      throw new WriterException("Bits size does not equal capacity");
    }
  }
  /**
   * Get number of data bytes and number of error correction bytes for block id "blockID". Store
   * the result in "numDataBytesInBlock", and "numECBytesInBlock". See table 12 in 8.5.1 of
   * JISX0510:2004 (p.30)
   */
  static getNumDataBytesAndNumECBytesForBlockID(numTotalBytes, numDataBytes, numRSBlocks, blockID, numDataBytesInBlock, numECBytesInBlock) {
    if (blockID >= numRSBlocks) {
      throw new WriterException("Block ID too large");
    }
    const numRsBlocksInGroup2 = numTotalBytes % numRSBlocks;
    const numRsBlocksInGroup1 = numRSBlocks - numRsBlocksInGroup2;
    const numTotalBytesInGroup1 = Math.floor(numTotalBytes / numRSBlocks);
    const numTotalBytesInGroup2 = numTotalBytesInGroup1 + 1;
    const numDataBytesInGroup1 = Math.floor(numDataBytes / numRSBlocks);
    const numDataBytesInGroup2 = numDataBytesInGroup1 + 1;
    const numEcBytesInGroup1 = numTotalBytesInGroup1 - numDataBytesInGroup1;
    const numEcBytesInGroup2 = numTotalBytesInGroup2 - numDataBytesInGroup2;
    if (numEcBytesInGroup1 !== numEcBytesInGroup2) {
      throw new WriterException("EC bytes mismatch");
    }
    if (numRSBlocks !== numRsBlocksInGroup1 + numRsBlocksInGroup2) {
      throw new WriterException("RS blocks mismatch");
    }
    if (numTotalBytes !== (numDataBytesInGroup1 + numEcBytesInGroup1) * numRsBlocksInGroup1 + (numDataBytesInGroup2 + numEcBytesInGroup2) * numRsBlocksInGroup2) {
      throw new WriterException("Total bytes mismatch");
    }
    if (blockID < numRsBlocksInGroup1) {
      numDataBytesInBlock[0] = numDataBytesInGroup1;
      numECBytesInBlock[0] = numEcBytesInGroup1;
    } else {
      numDataBytesInBlock[0] = numDataBytesInGroup2;
      numECBytesInBlock[0] = numEcBytesInGroup2;
    }
  }
  /**
   * Interleave "bits" with corresponding error correction bytes. On success, store the result in
   * "result". The interleave rule is complicated. See 8.6 of JISX0510:2004 (p.37) for details.
   */
  static interleaveWithECBytes(bits, numTotalBytes, numDataBytes, numRSBlocks) {
    if (bits.getSizeInBytes() !== numDataBytes) {
      throw new WriterException("Number of bits and data bytes does not match");
    }
    let dataBytesOffset = 0;
    let maxNumDataBytes = 0;
    let maxNumEcBytes = 0;
    const blocks = new Array();
    for (let i = 0; i < numRSBlocks; ++i) {
      const numDataBytesInBlock = new Int32Array(1);
      const numEcBytesInBlock = new Int32Array(1);
      QRCodeEncoder.getNumDataBytesAndNumECBytesForBlockID(
        numTotalBytes,
        numDataBytes,
        numRSBlocks,
        i,
        numDataBytesInBlock,
        numEcBytesInBlock
      );
      const size = numDataBytesInBlock[0];
      const dataBytes = new Uint8Array(size);
      bits.toBytes(8 * dataBytesOffset, dataBytes, 0, size);
      const ecBytes = QRCodeEncoder.generateECBytes(dataBytes, numEcBytesInBlock[0]);
      blocks.push(new BlockPair(dataBytes, ecBytes));
      maxNumDataBytes = Math.max(maxNumDataBytes, size);
      maxNumEcBytes = Math.max(maxNumEcBytes, ecBytes.length);
      dataBytesOffset += numDataBytesInBlock[0];
    }
    if (numDataBytes !== dataBytesOffset) {
      throw new WriterException("Data bytes does not match offset");
    }
    const result = new BitArray();
    for (let i = 0; i < maxNumDataBytes; ++i) {
      for (const block of blocks) {
        const dataBytes = block.getDataBytes();
        if (i < dataBytes.length) {
          result.appendBits(dataBytes[i], 8);
        }
      }
    }
    for (let i = 0; i < maxNumEcBytes; ++i) {
      for (const block of blocks) {
        const ecBytes = block.getErrorCorrectionBytes();
        if (i < ecBytes.length) {
          result.appendBits(ecBytes[i], 8);
        }
      }
    }
    if (numTotalBytes !== result.getSizeInBytes()) {
      throw new WriterException("Interleaving error: " + numTotalBytes + " and " + result.getSizeInBytes() + " differ.");
    }
    return result;
  }
  static generateECBytes(dataBytes, numEcBytesInBlock) {
    const numDataBytes = dataBytes.length;
    const toEncode = new Int32Array(numDataBytes + numEcBytesInBlock);
    for (let i = 0; i < numDataBytes; i++) {
      toEncode[i] = dataBytes[i] & 255;
    }
    new ReedSolomonEncoder(GenericGF.QR_CODE_FIELD_256).encode(toEncode, numEcBytesInBlock);
    const ecBytes = new Uint8Array(numEcBytesInBlock);
    for (let i = 0; i < numEcBytesInBlock; i++) {
      ecBytes[i] = /*(byte) */
      toEncode[numDataBytes + i];
    }
    return ecBytes;
  }
  /**
   * Append mode info. On success, store the result in "bits".
   */
  static appendModeInfo(mode, bits) {
    bits.appendBits(mode.getBits(), 4);
  }
  /**
   * Append length info. On success, store the result in "bits".
   */
  static appendLengthInfo(numLetters, version, mode, bits) {
    const numBits = mode.getCharacterCountBits(version);
    if (numLetters >= 1 << numBits) {
      throw new WriterException(numLetters + " is bigger than " + ((1 << numBits) - 1));
    }
    bits.appendBits(numLetters, numBits);
  }
  /**
   * Append "bytes" in "mode" mode (encoding) into "bits". On success, store the result in "bits".
   */
  static appendBytes(content, mode, bits, encoding) {
    switch (mode) {
      case QRCodeMode.NUMERIC:
        QRCodeEncoder.appendNumericBytes(content, bits);
        break;
      case QRCodeMode.ALPHANUMERIC:
        QRCodeEncoder.appendAlphanumericBytes(content, bits);
        break;
      case QRCodeMode.BYTE:
        QRCodeEncoder.append8BitBytes(content, bits, encoding);
        break;
      case QRCodeMode.KANJI:
        QRCodeEncoder.appendKanjiBytes(content, bits);
        break;
      default:
        throw new WriterException("Invalid mode: " + mode);
    }
  }
  static getDigit(singleCharacter) {
    return singleCharacter.charCodeAt(0) - 48;
  }
  static isDigit(singleCharacter) {
    const cn = QRCodeEncoder.getDigit(singleCharacter);
    return cn >= 0 && cn <= 9;
  }
  static appendNumericBytes(content, bits) {
    const length = content.length;
    let i = 0;
    while (i < length) {
      const num1 = QRCodeEncoder.getDigit(content.charAt(i));
      if (i + 2 < length) {
        const num2 = QRCodeEncoder.getDigit(content.charAt(i + 1));
        const num3 = QRCodeEncoder.getDigit(content.charAt(i + 2));
        bits.appendBits(num1 * 100 + num2 * 10 + num3, 10);
        i += 3;
      } else if (i + 1 < length) {
        const num2 = QRCodeEncoder.getDigit(content.charAt(i + 1));
        bits.appendBits(num1 * 10 + num2, 7);
        i += 2;
      } else {
        bits.appendBits(num1, 4);
        i++;
      }
    }
  }
  static appendAlphanumericBytes(content, bits) {
    const length = content.length;
    let i = 0;
    while (i < length) {
      const code1 = QRCodeEncoder.getAlphanumericCode(content.charCodeAt(i));
      if (code1 === -1) {
        throw new WriterException();
      }
      if (i + 1 < length) {
        const code2 = QRCodeEncoder.getAlphanumericCode(content.charCodeAt(i + 1));
        if (code2 === -1) {
          throw new WriterException();
        }
        bits.appendBits(code1 * 45 + code2, 11);
        i += 2;
      } else {
        bits.appendBits(code1, 6);
        i++;
      }
    }
  }
  static append8BitBytes(content, bits, encoding) {
    let bytes;
    try {
      bytes = ZXingStringEncoding.encode(content, encoding);
    } catch (uee) {
      throw new WriterException(uee);
    }
    for (let i = 0, length = bytes.length; i !== length; i++) {
      const b = bytes[i];
      bits.appendBits(b, 8);
    }
  }
  /**
   * @throws WriterException
   */
  static appendKanjiBytes(content, bits) {
    let bytes;
    try {
      bytes = ZXingStringEncoding.encode(content, CharacterSetECI.SJIS);
    } catch (uee) {
      throw new WriterException(uee);
    }
    const length = bytes.length;
    for (let i = 0; i < length; i += 2) {
      const byte1 = bytes[i] & 255;
      const byte2 = bytes[i + 1] & 255;
      const code = byte1 << 8 & 4294967295 | byte2;
      let subtracted = -1;
      if (code >= 33088 && code <= 40956) {
        subtracted = code - 33088;
      } else if (code >= 57408 && code <= 60351) {
        subtracted = code - 49472;
      }
      if (subtracted === -1) {
        throw new WriterException("Invalid byte sequence");
      }
      const encoded = (subtracted >> 8) * 192 + (subtracted & 255);
      bits.appendBits(encoded, 13);
    }
  }
  static appendECI(eci, bits) {
    bits.appendBits(QRCodeMode.ECI.getBits(), 4);
    bits.appendBits(eci.getValue(), 8);
  }
}

export { QRCodeEncoder };
//# sourceMappingURL=QRCodeEncoder.js.map
//# sourceMappingURL=QRCodeEncoder.js.map