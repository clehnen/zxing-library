import { BitSource } from '../../common/BitSource';
import { DecoderResult } from '../../common/DecoderResult';
import { StringUtils } from '../../common/StringUtils';
import { FormatException } from '../../FormatException';
import { ZXingStringBuilder } from '../../util/StringBuilder';
import { ZXingStringEncoding } from '../../util/ZXingStringEncoding';

class MicroQRDecodedBitStreamParser {
  static ALPHANUMERIC_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
  static MODE_NUMERIC = 0;
  static MODE_ALPHA = 1;
  static MODE_BYTE = 2;
  static MODE_KANJI = 3;
  static decode(bytes, version, hints) {
    const bits = new BitSource(bytes);
    const result = new ZXingStringBuilder();
    const byteSegments = [];
    const versionNumber = version.getVersionNumber();
    const modeIndicatorBits = version.getModeIndicatorBits();
    try {
      while (true) {
        let mode;
        if (modeIndicatorBits === 0) {
          mode = MicroQRDecodedBitStreamParser.MODE_NUMERIC;
        } else {
          if (bits.available() < modeIndicatorBits) break;
          const modeBits = bits.readBits(modeIndicatorBits);
          mode = MicroQRDecodedBitStreamParser.decodeMode(modeBits, versionNumber);
        }
        const countBits = MicroQRDecodedBitStreamParser.charCountBits(mode, versionNumber);
        if (bits.available() < countBits) break;
        const count = bits.readBits(countBits);
        if (count === 0) break;
        switch (mode) {
          case MicroQRDecodedBitStreamParser.MODE_NUMERIC:
            MicroQRDecodedBitStreamParser.decodeNumeric(bits, result, count);
            break;
          case MicroQRDecodedBitStreamParser.MODE_ALPHA:
            MicroQRDecodedBitStreamParser.decodeAlphanumeric(bits, result, count);
            break;
          case MicroQRDecodedBitStreamParser.MODE_BYTE:
            MicroQRDecodedBitStreamParser.decodeByte(bits, result, byteSegments, count, hints);
            break;
          case MicroQRDecodedBitStreamParser.MODE_KANJI:
            MicroQRDecodedBitStreamParser.decodeKanji(bits, result, count);
            break;
          default:
            throw new FormatException();
        }
      }
    } catch (e) {
      if (e instanceof FormatException) throw e;
      throw new FormatException();
    }
    return new DecoderResult(
      bytes,
      result.toString(),
      byteSegments.length === 0 ? null : byteSegments,
      version.getECLevelLabel(),
      -1,
      -1
    );
  }
  /**
   * Decode mode indicator bits.
   * M2 (1 bit):  0=Numeric, 1=Alpha
   * M3 (2 bits): 00=Numeric, 01=Alpha, 10=Byte, 11=Kanji
   * M4 (3 bits): 000=Numeric, 001=Alpha, 010=Byte, 100=Kanji
   */
  static decodeMode(modeBits, versionNumber) {
    switch (versionNumber) {
      case 2:
        return modeBits === 0 ? MicroQRDecodedBitStreamParser.MODE_NUMERIC : MicroQRDecodedBitStreamParser.MODE_ALPHA;
      case 3:
        switch (modeBits) {
          case 0:
            return MicroQRDecodedBitStreamParser.MODE_NUMERIC;
          case 1:
            return MicroQRDecodedBitStreamParser.MODE_ALPHA;
          case 2:
            return MicroQRDecodedBitStreamParser.MODE_BYTE;
          case 3:
            return MicroQRDecodedBitStreamParser.MODE_KANJI;
        }
        break;
      case 4:
        switch (modeBits) {
          case 0:
            return MicroQRDecodedBitStreamParser.MODE_NUMERIC;
          case 1:
            return MicroQRDecodedBitStreamParser.MODE_ALPHA;
          case 2:
            return MicroQRDecodedBitStreamParser.MODE_BYTE;
          case 4:
            return MicroQRDecodedBitStreamParser.MODE_KANJI;
        }
        break;
    }
    throw new FormatException();
  }
  /**
   * Character count bit widths by mode and version:
   *
   *            M1  M2  M3  M4
   * Numeric     3   4   5   6     → versionNumber + 2
   * Alpha       -   3   4   5     → versionNumber + 1
   * Byte        -   -   4   5     → versionNumber + 1  (M3=4, M4=5)
   * Kanji       -   -   3   4     → versionNumber      (M3=3, M4=4)
   */
  static charCountBits(mode, versionNumber) {
    switch (mode) {
      case MicroQRDecodedBitStreamParser.MODE_NUMERIC:
        return versionNumber + 2;
      // M1=3, M2=4, M3=5, M4=6
      case MicroQRDecodedBitStreamParser.MODE_ALPHA:
        return versionNumber + 1;
      // M2=3, M3=4, M4=5
      case MicroQRDecodedBitStreamParser.MODE_BYTE:
        return versionNumber + 1;
      // M3=4, M4=5
      case MicroQRDecodedBitStreamParser.MODE_KANJI:
        return versionNumber;
      // M3=3, M4=4
      default:
        throw new FormatException();
    }
  }
  static decodeNumeric(bits, result, count) {
    let remaining = count;
    while (remaining >= 3) {
      if (bits.available() < 10) throw new FormatException();
      const threeDigits = bits.readBits(10);
      if (threeDigits >= 1e3) throw new FormatException();
      result.append(MicroQRDecodedBitStreamParser.toChar(Math.floor(threeDigits / 100)));
      result.append(MicroQRDecodedBitStreamParser.toChar(Math.floor(threeDigits / 10) % 10));
      result.append(MicroQRDecodedBitStreamParser.toChar(threeDigits % 10));
      remaining -= 3;
    }
    if (remaining === 2) {
      if (bits.available() < 7) throw new FormatException();
      const twoDigits = bits.readBits(7);
      if (twoDigits >= 100) throw new FormatException();
      result.append(MicroQRDecodedBitStreamParser.toChar(Math.floor(twoDigits / 10)));
      result.append(MicroQRDecodedBitStreamParser.toChar(twoDigits % 10));
    } else if (remaining === 1) {
      if (bits.available() < 4) throw new FormatException();
      const oneDigit = bits.readBits(4);
      if (oneDigit >= 10) throw new FormatException();
      result.append(MicroQRDecodedBitStreamParser.toChar(oneDigit));
    }
  }
  static decodeAlphanumeric(bits, result, count) {
    let remaining = count;
    while (remaining > 1) {
      if (bits.available() < 11) throw new FormatException();
      const twoChars = bits.readBits(11);
      result.append(MicroQRDecodedBitStreamParser.toAlphaNum(Math.floor(twoChars / 45)));
      result.append(MicroQRDecodedBitStreamParser.toAlphaNum(twoChars % 45));
      remaining -= 2;
    }
    if (remaining === 1) {
      if (bits.available() < 6) throw new FormatException();
      result.append(MicroQRDecodedBitStreamParser.toAlphaNum(bits.readBits(6)));
    }
  }
  static decodeByte(bits, result, byteSegments, count, hints) {
    if (8 * count > bits.available()) throw new FormatException();
    const readBytes = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
      readBytes[i] = bits.readBits(8) & 255;
    }
    const encoding = StringUtils.guessEncoding(readBytes, hints);
    try {
      result.append(ZXingStringEncoding.decode(readBytes, encoding));
    } catch (e) {
      throw new FormatException();
    }
    byteSegments.push(readBytes);
  }
  static decodeKanji(bits, result, count) {
    if (13 * count > bits.available()) throw new FormatException();
    const buffer = new Uint8Array(2 * count);
    let offset = 0;
    for (let i = 0; i < count; i++) {
      const twoBytes = bits.readBits(13);
      let assembled = Math.floor(twoBytes / 192) << 8 | twoBytes % 192;
      assembled += assembled < 7936 ? 33088 : 49472;
      buffer[offset++] = assembled >> 8 & 255;
      buffer[offset++] = assembled & 255;
    }
    try {
      result.append(ZXingStringEncoding.decode(buffer, StringUtils.SHIFT_JIS));
    } catch (e) {
      throw new FormatException();
    }
  }
  static toChar(value) {
    if (value >= MicroQRDecodedBitStreamParser.ALPHANUMERIC_CHARS.length) {
      throw new FormatException();
    }
    return MicroQRDecodedBitStreamParser.ALPHANUMERIC_CHARS[value];
  }
  static toAlphaNum(value) {
    if (value >= MicroQRDecodedBitStreamParser.ALPHANUMERIC_CHARS.length) {
      throw new FormatException();
    }
    return MicroQRDecodedBitStreamParser.ALPHANUMERIC_CHARS[value];
  }
}

export { MicroQRDecodedBitStreamParser };
//# sourceMappingURL=MicroQRDecodedBitStreamParser.js.map
//# sourceMappingURL=MicroQRDecodedBitStreamParser.js.map