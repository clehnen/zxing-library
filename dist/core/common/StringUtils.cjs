'use strict';

var DecodeHintType = require('../DecodeHintType');
var CharacterSetECI = require('./CharacterSetECI');
var ZXingStringEncoding = require('../util/ZXingStringEncoding');

class StringUtils {
  static SHIFT_JIS = CharacterSetECI.CharacterSetECI.SJIS.getName();
  // "SJIS"
  static GB2312 = "GB2312";
  static ISO88591 = CharacterSetECI.CharacterSetECI.ISO8859_1.getName();
  // "ISO8859_1"
  static EUC_JP = "EUC_JP";
  static UTF8 = CharacterSetECI.CharacterSetECI.UTF8.getName();
  // "UTF8"
  static PLATFORM_DEFAULT_ENCODING = StringUtils.UTF8;
  // "UTF8"//Charset.defaultCharset().name()
  static ASSUME_SHIFT_JIS = false;
  // SHIFT_JIS.equalsIgnoreCase(PLATFORM_DEFAULT_ENCODING) ||
  // EUC_JP.equalsIgnoreCase(PLATFORM_DEFAULT_ENCODING);
  static castAsNonUtf8Char(code, encoding = null) {
    const e = encoding ? encoding.getName() : this.ISO88591;
    return ZXingStringEncoding.ZXingStringEncoding.decode(new Uint8Array([code]), e);
  }
  /**
   * @param bytes bytes encoding a string, whose encoding should be guessed
   * @param hints decode hints if applicable
   * @return name of guessed encoding; at the moment will only guess one of:
   *  {@link #SHIFT_JIS}, {@link #UTF8}, {@link #ISO88591}, or the platform
   *  default encoding if none of these can possibly be correct
   */
  static guessEncoding(bytes, hints) {
    if (hints !== null && hints !== void 0 && void 0 !== hints.get(DecodeHintType.DecodeHintType.CHARACTER_SET)) {
      return hints.get(DecodeHintType.DecodeHintType.CHARACTER_SET).toString();
    }
    const length = bytes.length;
    let canBeISO88591 = true;
    let canBeShiftJIS = true;
    let canBeUTF8 = true;
    let utf8BytesLeft = 0;
    let utf2BytesChars = 0;
    let utf3BytesChars = 0;
    let utf4BytesChars = 0;
    let sjisBytesLeft = 0;
    let sjisKatakanaChars = 0;
    let sjisCurKatakanaWordLength = 0;
    let sjisCurDoubleBytesWordLength = 0;
    let sjisMaxKatakanaWordLength = 0;
    let sjisMaxDoubleBytesWordLength = 0;
    let isoHighOther = 0;
    const utf8bom = bytes.length > 3 && bytes[0] === /*(byte) */
    239 && bytes[1] === /*(byte) */
    187 && bytes[2] === /*(byte) */
    191;
    for (let i = 0; i < length && (canBeISO88591 || canBeShiftJIS || canBeUTF8); i++) {
      const value = bytes[i] & 255;
      if (canBeUTF8) {
        if (utf8BytesLeft > 0) {
          if ((value & 128) === 0) {
            canBeUTF8 = false;
          } else {
            utf8BytesLeft--;
          }
        } else if ((value & 128) !== 0) {
          if ((value & 64) === 0) {
            canBeUTF8 = false;
          } else {
            utf8BytesLeft++;
            if ((value & 32) === 0) {
              utf2BytesChars++;
            } else {
              utf8BytesLeft++;
              if ((value & 16) === 0) {
                utf3BytesChars++;
              } else {
                utf8BytesLeft++;
                if ((value & 8) === 0) {
                  utf4BytesChars++;
                } else {
                  canBeUTF8 = false;
                }
              }
            }
          }
        }
      }
      if (canBeISO88591) {
        if (value > 127 && value < 160) {
          canBeISO88591 = false;
        } else if (value > 159) {
          if (value < 192 || value === 215 || value === 247) {
            isoHighOther++;
          }
        }
      }
      if (canBeShiftJIS) {
        if (sjisBytesLeft > 0) {
          if (value < 64 || value === 127 || value > 252) {
            canBeShiftJIS = false;
          } else {
            sjisBytesLeft--;
          }
        } else if (value === 128 || value === 160 || value > 239) {
          canBeShiftJIS = false;
        } else if (value > 160 && value < 224) {
          sjisKatakanaChars++;
          sjisCurDoubleBytesWordLength = 0;
          sjisCurKatakanaWordLength++;
          if (sjisCurKatakanaWordLength > sjisMaxKatakanaWordLength) {
            sjisMaxKatakanaWordLength = sjisCurKatakanaWordLength;
          }
        } else if (value > 127) {
          sjisBytesLeft++;
          sjisCurKatakanaWordLength = 0;
          sjisCurDoubleBytesWordLength++;
          if (sjisCurDoubleBytesWordLength > sjisMaxDoubleBytesWordLength) {
            sjisMaxDoubleBytesWordLength = sjisCurDoubleBytesWordLength;
          }
        } else {
          sjisCurKatakanaWordLength = 0;
          sjisCurDoubleBytesWordLength = 0;
        }
      }
    }
    if (canBeUTF8 && utf8BytesLeft > 0) {
      canBeUTF8 = false;
    }
    if (canBeShiftJIS && sjisBytesLeft > 0) {
      canBeShiftJIS = false;
    }
    if (canBeUTF8 && (utf8bom || utf2BytesChars + utf3BytesChars + utf4BytesChars > 0)) {
      return StringUtils.UTF8;
    }
    if (canBeShiftJIS && (StringUtils.ASSUME_SHIFT_JIS || sjisMaxKatakanaWordLength >= 3 || sjisMaxDoubleBytesWordLength >= 3)) {
      return StringUtils.SHIFT_JIS;
    }
    if (canBeISO88591 && canBeShiftJIS) {
      return sjisMaxKatakanaWordLength === 2 && sjisKatakanaChars === 2 || isoHighOther * 10 >= length ? StringUtils.SHIFT_JIS : StringUtils.ISO88591;
    }
    if (canBeISO88591) {
      return StringUtils.ISO88591;
    }
    if (canBeShiftJIS) {
      return StringUtils.SHIFT_JIS;
    }
    if (canBeUTF8) {
      return StringUtils.UTF8;
    }
    return StringUtils.PLATFORM_DEFAULT_ENCODING;
  }
  /**
   *
   * @see https://stackoverflow.com/a/13439711/4367683
   *
   * @param append The new string to append.
   * @param args Argumets values to be formated.
   */
  static format(append, ...args) {
    let i = -1;
    function callback(exp, p0, p1, p2, p3, p4) {
      if (exp === "%%") return "%";
      if (args[++i] === void 0) return void 0;
      exp = p2 ? parseInt(p2.substr(1)) : void 0;
      let base = p3 ? parseInt(p3.substr(1)) : void 0;
      let val;
      switch (p4) {
        case "s":
          val = args[i];
          break;
        case "c":
          val = args[i][0];
          break;
        case "f":
          val = parseFloat(args[i]).toFixed(exp);
          break;
        case "p":
          val = parseFloat(args[i]).toPrecision(exp);
          break;
        case "e":
          val = parseFloat(args[i]).toExponential(exp);
          break;
        case "x":
          val = parseInt(args[i]).toString(base ? base : 16);
          break;
        case "d":
          val = parseFloat(parseInt(args[i], base ? base : 10).toPrecision(exp)).toFixed(0);
          break;
      }
      val = typeof val === "object" ? JSON.stringify(val) : (+val).toString(base);
      let size = parseInt(p1);
      let ch = p1 && p1[0] + "" === "0" ? "0" : " ";
      while (val.length < size) val = p0 !== void 0 ? val + ch : ch + val;
      return val;
    }
    let regex = /%(-)?(0?[0-9]+)?([.][0-9]+)?([#][0-9]+)?([scfpexd%])/g;
    return append.replace(regex, callback);
  }
  /**
   *
   */
  static getBytes(str, encoding) {
    return ZXingStringEncoding.ZXingStringEncoding.encode(str, encoding);
  }
  /**
   * Returns the charcode at the specified index or at index zero.
   */
  static getCharCode(str, index = 0) {
    return str.charCodeAt(index);
  }
  /**
   * Returns char for given charcode
   */
  static getCharAt(charCode) {
    return String.fromCharCode(charCode);
  }
}

exports.StringUtils = StringUtils;
//# sourceMappingURL=StringUtils.cjs.map
//# sourceMappingURL=StringUtils.cjs.map