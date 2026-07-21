'use strict';

var DecoderResult = require('../../common/DecoderResult');
var FormatException = require('../../FormatException');

class MaxiCodeDecodedBitStreamParser {
  static SHIFTA = "\uFFF0";
  static SHIFTB = "\uFFF1";
  static SHIFTC = "\uFFF2";
  static SHIFTD = "\uFFF3";
  static SHIFTE = "\uFFF4";
  static TWOSHIFTA = "\uFFF5";
  static THREESHIFTA = "\uFFF6";
  static LATCHA = "\uFFF7";
  static LATCHB = "\uFFF8";
  static LOCK = "\uFFF9";
  static ECI = "\uFFFA";
  static NS = "\uFFFB";
  static PAD = "\uFFFC";
  static FS = "";
  static GS = "";
  static RS = "";
  static COUNTRY_BYTES = [53, 54, 43, 44, 45, 46, 47, 48, 37, 38];
  static SERVICE_CLASS_BYTES = [55, 56, 57, 58, 59, 60, 49, 50, 51, 52];
  static POSTCODE_2_LENGTH_BYTES = [39, 40, 41, 42, 31, 32];
  static POSTCODE_2_BYTES = [
    33,
    34,
    35,
    36,
    25,
    26,
    27,
    28,
    29,
    30,
    19,
    20,
    21,
    22,
    23,
    24,
    13,
    14,
    15,
    16,
    17,
    18,
    7,
    8,
    9,
    10,
    11,
    12,
    1,
    2
  ];
  static POSTCODE_3_BYTES = [
    [39, 40, 41, 42, 31, 32],
    [33, 34, 35, 36, 25, 26],
    [27, 28, 29, 30, 19, 20],
    [21, 22, 23, 24, 13, 14],
    [15, 16, 17, 18, 7, 8],
    [9, 10, 11, 12, 1, 2]
  ];
  /* tslint:disable:max-line-length */
  static SETS = [
    "\rABCDEFGHIJKLMNOPQRSTUVWXYZ" + MaxiCodeDecodedBitStreamParser.ECI + MaxiCodeDecodedBitStreamParser.FS + MaxiCodeDecodedBitStreamParser.GS + MaxiCodeDecodedBitStreamParser.RS + MaxiCodeDecodedBitStreamParser.NS + " " + MaxiCodeDecodedBitStreamParser.PAD + `"#$%&'()*+,-./0123456789:` + MaxiCodeDecodedBitStreamParser.SHIFTB + MaxiCodeDecodedBitStreamParser.SHIFTC + MaxiCodeDecodedBitStreamParser.SHIFTD + MaxiCodeDecodedBitStreamParser.SHIFTE + MaxiCodeDecodedBitStreamParser.LATCHB,
    "`abcdefghijklmnopqrstuvwxyz" + MaxiCodeDecodedBitStreamParser.ECI + MaxiCodeDecodedBitStreamParser.FS + MaxiCodeDecodedBitStreamParser.GS + MaxiCodeDecodedBitStreamParser.RS + MaxiCodeDecodedBitStreamParser.NS + "{" + MaxiCodeDecodedBitStreamParser.PAD + "}~\x7F;<=>?[\\]^_ ,./:@!|" + MaxiCodeDecodedBitStreamParser.PAD + MaxiCodeDecodedBitStreamParser.TWOSHIFTA + MaxiCodeDecodedBitStreamParser.THREESHIFTA + MaxiCodeDecodedBitStreamParser.PAD + MaxiCodeDecodedBitStreamParser.SHIFTA + MaxiCodeDecodedBitStreamParser.SHIFTC + MaxiCodeDecodedBitStreamParser.SHIFTD + MaxiCodeDecodedBitStreamParser.SHIFTE + MaxiCodeDecodedBitStreamParser.LATCHA,
    "\xC0\xC1\xC2\xC3\xC4\xC5\xC6\xC7\xC8\xC9\xCA\xCB\xCC\xCD\xCE\xCF\xD0\xD1\xD2\xD3\xD4\xD5\xD6\xD7\xD8\xD9\xDA" + MaxiCodeDecodedBitStreamParser.ECI + MaxiCodeDecodedBitStreamParser.FS + MaxiCodeDecodedBitStreamParser.GS + MaxiCodeDecodedBitStreamParser.RS + MaxiCodeDecodedBitStreamParser.NS + "\xDB\xDC\xDD\xDE\xDF\xAA\xAC\xB1\xB2\xB3\xB5\xB9\xBA\xBC\xBD\xBE\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89" + MaxiCodeDecodedBitStreamParser.LATCHA + " " + MaxiCodeDecodedBitStreamParser.LOCK + MaxiCodeDecodedBitStreamParser.SHIFTD + MaxiCodeDecodedBitStreamParser.SHIFTE + MaxiCodeDecodedBitStreamParser.LATCHB,
    "\xE0\xE1\xE2\xE3\xE4\xE5\xE6\xE7\xE8\xE9\xEA\xEB\xEC\xED\xEE\xEF\xF0\xF1\xF2\xF3\xF4\xF5\xF6\xF7\xF8\xF9\xFA" + MaxiCodeDecodedBitStreamParser.ECI + MaxiCodeDecodedBitStreamParser.FS + MaxiCodeDecodedBitStreamParser.GS + MaxiCodeDecodedBitStreamParser.RS + MaxiCodeDecodedBitStreamParser.NS + "\xFB\xFC\xFD\xFE\xFF\xA1\xA8\xAB\xAF\xB0\xB4\xB7\xB8\xBB\xBF\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94" + MaxiCodeDecodedBitStreamParser.LATCHA + " " + MaxiCodeDecodedBitStreamParser.SHIFTC + MaxiCodeDecodedBitStreamParser.LOCK + MaxiCodeDecodedBitStreamParser.SHIFTE + MaxiCodeDecodedBitStreamParser.LATCHB,
    "\0\x07\b	\n\v\f\r" + MaxiCodeDecodedBitStreamParser.ECI + MaxiCodeDecodedBitStreamParser.PAD + MaxiCodeDecodedBitStreamParser.PAD + "\x1B" + MaxiCodeDecodedBitStreamParser.NS + MaxiCodeDecodedBitStreamParser.FS + MaxiCodeDecodedBitStreamParser.GS + MaxiCodeDecodedBitStreamParser.RS + "\x9F\xA0\xA2\xA3\xA4\xA5\xA6\xA7\xA9\xAD\xAE\xB6\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E" + MaxiCodeDecodedBitStreamParser.LATCHA + " " + MaxiCodeDecodedBitStreamParser.SHIFTC + MaxiCodeDecodedBitStreamParser.SHIFTD + MaxiCodeDecodedBitStreamParser.LOCK + MaxiCodeDecodedBitStreamParser.LATCHB
  ];
  /* tslint:enable:max-line-length */
  constructor() {
  }
  static decode(bytes, mode) {
    const result = [];
    switch (mode) {
      case 2:
      case 3: {
        let postcode;
        if (mode === 2) {
          const pc = MaxiCodeDecodedBitStreamParser.getPostCode2(bytes);
          const ps2Length = MaxiCodeDecodedBitStreamParser.getPostCode2Length(bytes);
          if (ps2Length > 10) {
            throw FormatException.FormatException.getFormatInstance();
          }
          postcode = String(pc).padStart(ps2Length, "0");
        } else {
          postcode = MaxiCodeDecodedBitStreamParser.getPostCode3(bytes);
        }
        const country = String(MaxiCodeDecodedBitStreamParser.getCountry(bytes)).padStart(3, "0");
        const service = String(MaxiCodeDecodedBitStreamParser.getServiceClass(bytes)).padStart(3, "0");
        const message = MaxiCodeDecodedBitStreamParser.getMessage(bytes, 10, 84);
        result.push(message);
        if (result.join("").startsWith("[)>" + MaxiCodeDecodedBitStreamParser.RS + "01" + MaxiCodeDecodedBitStreamParser.GS)) {
          result.splice(0, result.length);
          result.push(message.substring(0, 9));
          result.push(postcode + MaxiCodeDecodedBitStreamParser.GS + country + MaxiCodeDecodedBitStreamParser.GS + service + MaxiCodeDecodedBitStreamParser.GS);
          result.push(message.substring(9));
        } else {
          result.splice(0, result.length);
          result.push(postcode + MaxiCodeDecodedBitStreamParser.GS + country + MaxiCodeDecodedBitStreamParser.GS + service + MaxiCodeDecodedBitStreamParser.GS);
          result.push(message);
        }
        break;
      }
      case 4:
        result.push(MaxiCodeDecodedBitStreamParser.getMessage(bytes, 1, 93));
        break;
      case 5:
        result.push(MaxiCodeDecodedBitStreamParser.getMessage(bytes, 1, 77));
        break;
    }
    return new DecoderResult.DecoderResult(bytes, result.join(""), null, String(mode));
  }
  static getBit(bit, bytes) {
    bit--;
    return (bytes[Math.floor(bit / 6)] & 1 << 5 - bit % 6) === 0 ? 0 : 1;
  }
  static getInt(bytes, x) {
    let val = 0;
    for (let i = 0; i < x.length; i++) {
      val += MaxiCodeDecodedBitStreamParser.getBit(x[i], bytes) << x.length - i - 1;
    }
    return val;
  }
  static getCountry(bytes) {
    return MaxiCodeDecodedBitStreamParser.getInt(bytes, MaxiCodeDecodedBitStreamParser.COUNTRY_BYTES);
  }
  static getServiceClass(bytes) {
    return MaxiCodeDecodedBitStreamParser.getInt(bytes, MaxiCodeDecodedBitStreamParser.SERVICE_CLASS_BYTES);
  }
  static getPostCode2Length(bytes) {
    return MaxiCodeDecodedBitStreamParser.getInt(bytes, MaxiCodeDecodedBitStreamParser.POSTCODE_2_LENGTH_BYTES);
  }
  static getPostCode2(bytes) {
    return MaxiCodeDecodedBitStreamParser.getInt(bytes, MaxiCodeDecodedBitStreamParser.POSTCODE_2_BYTES);
  }
  static getPostCode3(bytes) {
    const sb = [];
    for (const p3bytes of MaxiCodeDecodedBitStreamParser.POSTCODE_3_BYTES) {
      sb.push(MaxiCodeDecodedBitStreamParser.SETS[0].charAt(MaxiCodeDecodedBitStreamParser.getInt(bytes, p3bytes)));
    }
    return sb.join("");
  }
  static getMessage(bytes, start, len) {
    const sb = [];
    let shift = -1;
    let set = 0;
    let lastset = 0;
    for (let i = start; i < start + len; i++) {
      const c = MaxiCodeDecodedBitStreamParser.SETS[set].charAt(bytes[i]);
      switch (c) {
        case MaxiCodeDecodedBitStreamParser.LATCHA:
          set = 0;
          shift = -1;
          break;
        case MaxiCodeDecodedBitStreamParser.LATCHB:
          set = 1;
          shift = -1;
          break;
        case MaxiCodeDecodedBitStreamParser.SHIFTA:
        case MaxiCodeDecodedBitStreamParser.SHIFTB:
        case MaxiCodeDecodedBitStreamParser.SHIFTC:
        case MaxiCodeDecodedBitStreamParser.SHIFTD:
        case MaxiCodeDecodedBitStreamParser.SHIFTE:
          lastset = set;
          set = c.charCodeAt(0) - MaxiCodeDecodedBitStreamParser.SHIFTA.charCodeAt(0);
          shift = 1;
          break;
        case MaxiCodeDecodedBitStreamParser.TWOSHIFTA:
          lastset = set;
          set = 0;
          shift = 2;
          break;
        case MaxiCodeDecodedBitStreamParser.THREESHIFTA:
          lastset = set;
          set = 0;
          shift = 3;
          break;
        case MaxiCodeDecodedBitStreamParser.NS: {
          const nsval = (bytes[++i] << 24) + (bytes[++i] << 18) + (bytes[++i] << 12) + (bytes[++i] << 6) + bytes[++i];
          sb.push(String(nsval).padStart(9, "0"));
          break;
        }
        case MaxiCodeDecodedBitStreamParser.LOCK:
          shift = -1;
          break;
        default:
          sb.push(c);
      }
      if (shift-- === 0) {
        set = lastset;
      }
    }
    while (sb.length > 0 && sb[sb.length - 1] === MaxiCodeDecodedBitStreamParser.PAD) {
      sb.pop();
    }
    return sb.join("");
  }
}

exports.MaxiCodeDecodedBitStreamParser = MaxiCodeDecodedBitStreamParser;
//# sourceMappingURL=MaxiCodeDecodedBitStreamParser.cjs.map
//# sourceMappingURL=MaxiCodeDecodedBitStreamParser.cjs.map