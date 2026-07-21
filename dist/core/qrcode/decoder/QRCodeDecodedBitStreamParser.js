import { BitSource } from '../../common/BitSource';
import { CharacterSetECI } from '../../common/CharacterSetECI';
import { DecoderResult } from '../../common/DecoderResult';
import { StringUtils } from '../../common/StringUtils';
import { FormatException } from '../../FormatException';
import { ZXingStringBuilder } from '../../util/StringBuilder';
import { ZXingStringEncoding } from '../../util/ZXingStringEncoding';
import { QRCodeMode } from './QRCodeMode';

class QRCodeDecodedBitStreamParser {
  /**
   * See ISO 18004:2006, 6.4.4 Table 5
   */
  static ALPHANUMERIC_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
  static GB2312_SUBSET = 1;
  static decode(bytes, version, ecLevel, hints) {
    const bits = new BitSource(bytes);
    let result = new ZXingStringBuilder();
    const byteSegments = new Array();
    let symbolSequence = -1;
    let parityData = -1;
    try {
      let currentCharacterSetECI = null;
      let fc1InEffect = false;
      let mode;
      do {
        if (bits.available() < 4) {
          mode = QRCodeMode.TERMINATOR;
        } else {
          const modeBits = bits.readBits(4);
          mode = QRCodeMode.forBits(modeBits);
        }
        switch (mode) {
          case QRCodeMode.TERMINATOR:
            break;
          case QRCodeMode.FNC1_FIRST_POSITION:
          case QRCodeMode.FNC1_SECOND_POSITION:
            fc1InEffect = true;
            break;
          case QRCodeMode.STRUCTURED_APPEND:
            if (bits.available() < 16) {
              throw new FormatException();
            }
            symbolSequence = bits.readBits(8);
            parityData = bits.readBits(8);
            break;
          case QRCodeMode.ECI:
            const value = QRCodeDecodedBitStreamParser.parseECIValue(bits);
            currentCharacterSetECI = CharacterSetECI.getCharacterSetECIByValue(value);
            if (currentCharacterSetECI === null) {
              throw new FormatException();
            }
            break;
          case QRCodeMode.HANZI:
            const subset = bits.readBits(4);
            const countHanzi = bits.readBits(mode.getCharacterCountBits(version));
            if (subset === QRCodeDecodedBitStreamParser.GB2312_SUBSET) {
              QRCodeDecodedBitStreamParser.decodeHanziSegment(bits, result, countHanzi);
            }
            break;
          default:
            const count = bits.readBits(mode.getCharacterCountBits(version));
            switch (mode) {
              case QRCodeMode.NUMERIC:
                QRCodeDecodedBitStreamParser.decodeNumericSegment(bits, result, count);
                break;
              case QRCodeMode.ALPHANUMERIC:
                QRCodeDecodedBitStreamParser.decodeAlphanumericSegment(bits, result, count, fc1InEffect);
                break;
              case QRCodeMode.BYTE:
                QRCodeDecodedBitStreamParser.decodeByteSegment(bits, result, count, currentCharacterSetECI, byteSegments, hints);
                break;
              case QRCodeMode.KANJI:
                QRCodeDecodedBitStreamParser.decodeKanjiSegment(bits, result, count);
                break;
              default:
                throw new FormatException();
            }
            break;
        }
      } while (mode !== QRCodeMode.TERMINATOR);
    } catch (iae) {
      throw new FormatException();
    }
    return new DecoderResult(
      bytes,
      result.toString(),
      byteSegments.length === 0 ? null : byteSegments,
      ecLevel === null ? null : ecLevel.toString(),
      symbolSequence,
      parityData
    );
  }
  /**
   * See specification GBT 18284-2000
   */
  static decodeHanziSegment(bits, result, count) {
    if (count * 13 > bits.available()) {
      throw new FormatException();
    }
    const buffer = new Uint8Array(2 * count);
    let offset = 0;
    while (count > 0) {
      const twoBytes = bits.readBits(13);
      let assembledTwoBytes = twoBytes / 96 << 8 & 4294967295 | twoBytes % 96;
      if (assembledTwoBytes < 959) {
        assembledTwoBytes += 41377;
      } else {
        assembledTwoBytes += 42657;
      }
      buffer[offset] = /*(byte) */
      assembledTwoBytes >> 8 & 255;
      buffer[offset + 1] = /*(byte) */
      assembledTwoBytes & 255;
      offset += 2;
      count--;
    }
    try {
      result.append(ZXingStringEncoding.decode(buffer, StringUtils.GB2312));
    } catch (ignored) {
      throw new FormatException(ignored);
    }
  }
  static decodeKanjiSegment(bits, result, count) {
    if (count * 13 > bits.available()) {
      throw new FormatException();
    }
    const buffer = new Uint8Array(2 * count);
    let offset = 0;
    while (count > 0) {
      const twoBytes = bits.readBits(13);
      let assembledTwoBytes = twoBytes / 192 << 8 & 4294967295 | twoBytes % 192;
      if (assembledTwoBytes < 7936) {
        assembledTwoBytes += 33088;
      } else {
        assembledTwoBytes += 49472;
      }
      buffer[offset] = /*(byte) */
      assembledTwoBytes >> 8;
      buffer[offset + 1] = /*(byte) */
      assembledTwoBytes;
      offset += 2;
      count--;
    }
    try {
      result.append(ZXingStringEncoding.decode(buffer, StringUtils.SHIFT_JIS));
    } catch (ignored) {
      throw new FormatException(ignored);
    }
  }
  static decodeByteSegment(bits, result, count, currentCharacterSetECI, byteSegments, hints) {
    if (8 * count > bits.available()) {
      throw new FormatException();
    }
    const readBytes = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
      readBytes[i] = /*(byte) */
      bits.readBits(8);
    }
    let encoding;
    if (currentCharacterSetECI === null) {
      encoding = StringUtils.guessEncoding(readBytes, hints);
    } else {
      encoding = currentCharacterSetECI.getName();
    }
    try {
      result.append(ZXingStringEncoding.decode(readBytes, encoding));
    } catch (ignored) {
      throw new FormatException(ignored);
    }
    byteSegments.push(readBytes);
  }
  static toAlphaNumericChar(value) {
    if (value >= QRCodeDecodedBitStreamParser.ALPHANUMERIC_CHARS.length) {
      throw new FormatException();
    }
    return QRCodeDecodedBitStreamParser.ALPHANUMERIC_CHARS[value];
  }
  static decodeAlphanumericSegment(bits, result, count, fc1InEffect) {
    const start = result.length();
    while (count > 1) {
      if (bits.available() < 11) {
        throw new FormatException();
      }
      const nextTwoCharsBits = bits.readBits(11);
      result.append(QRCodeDecodedBitStreamParser.toAlphaNumericChar(Math.floor(nextTwoCharsBits / 45)));
      result.append(QRCodeDecodedBitStreamParser.toAlphaNumericChar(nextTwoCharsBits % 45));
      count -= 2;
    }
    if (count === 1) {
      if (bits.available() < 6) {
        throw new FormatException();
      }
      result.append(QRCodeDecodedBitStreamParser.toAlphaNumericChar(bits.readBits(6)));
    }
    if (fc1InEffect) {
      for (let i = start; i < result.length(); i++) {
        if (result.charAt(i) === "%") {
          if (i < result.length() - 1 && result.charAt(i + 1) === "%") {
            result.deleteCharAt(i + 1);
          } else {
            result.setCharAt(i, String.fromCharCode(29));
          }
        }
      }
    }
  }
  static decodeNumericSegment(bits, result, count) {
    while (count >= 3) {
      if (bits.available() < 10) {
        throw new FormatException();
      }
      const threeDigitsBits = bits.readBits(10);
      if (threeDigitsBits >= 1e3) {
        throw new FormatException();
      }
      result.append(QRCodeDecodedBitStreamParser.toAlphaNumericChar(Math.floor(threeDigitsBits / 100)));
      result.append(QRCodeDecodedBitStreamParser.toAlphaNumericChar(Math.floor(threeDigitsBits / 10) % 10));
      result.append(QRCodeDecodedBitStreamParser.toAlphaNumericChar(threeDigitsBits % 10));
      count -= 3;
    }
    if (count === 2) {
      if (bits.available() < 7) {
        throw new FormatException();
      }
      const twoDigitsBits = bits.readBits(7);
      if (twoDigitsBits >= 100) {
        throw new FormatException();
      }
      result.append(QRCodeDecodedBitStreamParser.toAlphaNumericChar(Math.floor(twoDigitsBits / 10)));
      result.append(QRCodeDecodedBitStreamParser.toAlphaNumericChar(twoDigitsBits % 10));
    } else if (count === 1) {
      if (bits.available() < 4) {
        throw new FormatException();
      }
      const digitBits = bits.readBits(4);
      if (digitBits >= 10) {
        throw new FormatException();
      }
      result.append(QRCodeDecodedBitStreamParser.toAlphaNumericChar(digitBits));
    }
  }
  static parseECIValue(bits) {
    const firstByte = bits.readBits(8);
    if ((firstByte & 128) === 0) {
      return firstByte & 127;
    }
    if ((firstByte & 192) === 128) {
      const secondByte = bits.readBits(8);
      return (firstByte & 63) << 8 & 4294967295 | secondByte;
    }
    if ((firstByte & 224) === 192) {
      const secondThirdBytes = bits.readBits(16);
      return (firstByte & 31) << 16 & 4294967295 | secondThirdBytes;
    }
    throw new FormatException();
  }
}

export { QRCodeDecodedBitStreamParser };
//# sourceMappingURL=QRCodeDecodedBitStreamParser.js.map
//# sourceMappingURL=QRCodeDecodedBitStreamParser.js.map