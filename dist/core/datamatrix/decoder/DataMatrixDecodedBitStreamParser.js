import { DecoderResult } from '../../common/DecoderResult';
import { BitSource } from '../../common/BitSource';
import { ZXingStringBuilder } from '../../util/StringBuilder';
import { ZXingStringEncoding } from '../../util/ZXingStringEncoding';
import { StringUtils } from '../../common/StringUtils';
import { FormatException } from '../../FormatException';
import { IllegalStateException } from '../../IllegalStateException';

class DataMatrixDecodedBitStreamParser {
  /**
   * See ISO 16022:2006, Annex C Table C.1
   * The C40 Basic Character Set (*'s used for placeholders for the shift values)
   */
  static C40_BASIC_SET_CHARS = [
    "*",
    "*",
    "*",
    " ",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z"
  ];
  static C40_SHIFT2_SET_CHARS = [
    "!",
    '"',
    "#",
    "$",
    "%",
    "&",
    "'",
    "(",
    ")",
    "*",
    "+",
    ",",
    "-",
    ".",
    "/",
    ":",
    ";",
    "<",
    "=",
    ">",
    "?",
    "@",
    "[",
    "\\",
    "]",
    "^",
    "_"
  ];
  /**
   * See ISO 16022:2006, Annex C Table C.2
   * The Text Basic Character Set (*'s used for placeholders for the shift values)
   */
  static TEXT_BASIC_SET_CHARS = [
    "*",
    "*",
    "*",
    " ",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z"
  ];
  // Shift 2 for Text is the same encoding as C40
  static TEXT_SHIFT2_SET_CHARS = DataMatrixDecodedBitStreamParser.C40_SHIFT2_SET_CHARS;
  static TEXT_SHIFT3_SET_CHARS = [
    "`",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "{",
    "|",
    "}",
    "~",
    String.fromCharCode(127)
  ];
  static decode(bytes) {
    const bits = new BitSource(bytes);
    const result = new ZXingStringBuilder();
    const resultTrailer = new ZXingStringBuilder();
    const byteSegments = new Array();
    let mode = 1 /* ASCII_ENCODE */;
    do {
      if (mode === 1 /* ASCII_ENCODE */) {
        mode = this.decodeAsciiSegment(bits, result, resultTrailer);
      } else {
        switch (mode) {
          case 2 /* C40_ENCODE */:
            this.decodeC40Segment(bits, result);
            break;
          case 3 /* TEXT_ENCODE */:
            this.decodeTextSegment(bits, result);
            break;
          case 4 /* ANSIX12_ENCODE */:
            this.decodeAnsiX12Segment(bits, result);
            break;
          case 5 /* EDIFACT_ENCODE */:
            this.decodeEdifactSegment(bits, result);
            break;
          case 6 /* BASE256_ENCODE */:
            this.decodeBase256Segment(bits, result, byteSegments);
            break;
          default:
            throw new FormatException();
        }
        mode = 1 /* ASCII_ENCODE */;
      }
    } while (mode !== 0 /* PAD_ENCODE */ && bits.available() > 0);
    if (resultTrailer.length() > 0) {
      result.append(resultTrailer.toString());
    }
    return new DecoderResult(bytes, result.toString(), byteSegments.length === 0 ? null : byteSegments, null);
  }
  /**
   * See ISO 16022:2006, 5.2.3 and Annex C, Table C.2
   */
  static decodeAsciiSegment(bits, result, resultTrailer) {
    let upperShift = false;
    do {
      let oneByte = bits.readBits(8);
      if (oneByte === 0) {
        throw new FormatException();
      } else if (oneByte <= 128) {
        if (upperShift) {
          oneByte += 128;
        }
        result.append(String.fromCharCode(oneByte - 1));
        return 1 /* ASCII_ENCODE */;
      } else if (oneByte === 129) {
        return 0 /* PAD_ENCODE */;
      } else if (oneByte <= 229) {
        const value = oneByte - 130;
        if (value < 10) {
          result.append("0");
        }
        result.append("" + value);
      } else {
        switch (oneByte) {
          case 230:
            return 2 /* C40_ENCODE */;
          case 231:
            return 6 /* BASE256_ENCODE */;
          case 232:
            result.append(String.fromCharCode(29));
            break;
          case 233:
          // Structured Append
          case 234:
            break;
          case 235:
            upperShift = true;
            break;
          case 236:
            result.append("[)>05");
            resultTrailer.insert(0, "");
            break;
          case 237:
            result.append("[)>06");
            resultTrailer.insert(0, "");
            break;
          case 238:
            return 4 /* ANSIX12_ENCODE */;
          case 239:
            return 3 /* TEXT_ENCODE */;
          case 240:
            return 5 /* EDIFACT_ENCODE */;
          case 241:
            break;
          default:
            if (oneByte !== 254 || bits.available() !== 0) {
              throw new FormatException();
            }
            break;
        }
      }
    } while (bits.available() > 0);
    return 1 /* ASCII_ENCODE */;
  }
  /**
   * See ISO 16022:2006, 5.2.5 and Annex C, Table C.1
   */
  static decodeC40Segment(bits, result) {
    let upperShift = false;
    const cValues = [];
    let shift = 0;
    do {
      if (bits.available() === 8) {
        return;
      }
      const firstByte = bits.readBits(8);
      if (firstByte === 254) {
        return;
      }
      this.parseTwoBytes(firstByte, bits.readBits(8), cValues);
      for (let i = 0; i < 3; i++) {
        const cValue = cValues[i];
        switch (shift) {
          case 0:
            if (cValue < 3) {
              shift = cValue + 1;
            } else if (cValue < this.C40_BASIC_SET_CHARS.length) {
              const c40char = this.C40_BASIC_SET_CHARS[cValue];
              if (upperShift) {
                result.append(String.fromCharCode(c40char.charCodeAt(0) + 128));
                upperShift = false;
              } else {
                result.append(c40char);
              }
            } else {
              throw new FormatException();
            }
            break;
          case 1:
            if (upperShift) {
              result.append(String.fromCharCode(cValue + 128));
              upperShift = false;
            } else {
              result.append(String.fromCharCode(cValue));
            }
            shift = 0;
            break;
          case 2:
            if (cValue < this.C40_SHIFT2_SET_CHARS.length) {
              const c40char = this.C40_SHIFT2_SET_CHARS[cValue];
              if (upperShift) {
                result.append(String.fromCharCode(c40char.charCodeAt(0) + 128));
                upperShift = false;
              } else {
                result.append(c40char);
              }
            } else {
              switch (cValue) {
                case 27:
                  result.append(String.fromCharCode(29));
                  break;
                case 30:
                  upperShift = true;
                  break;
                default:
                  throw new FormatException();
              }
            }
            shift = 0;
            break;
          case 3:
            if (upperShift) {
              result.append(String.fromCharCode(cValue + 224));
              upperShift = false;
            } else {
              result.append(String.fromCharCode(cValue + 96));
            }
            shift = 0;
            break;
          default:
            throw new FormatException();
        }
      }
    } while (bits.available() > 0);
  }
  /**
   * See ISO 16022:2006, 5.2.6 and Annex C, Table C.2
   */
  static decodeTextSegment(bits, result) {
    let upperShift = false;
    let cValues = [];
    let shift = 0;
    do {
      if (bits.available() === 8) {
        return;
      }
      const firstByte = bits.readBits(8);
      if (firstByte === 254) {
        return;
      }
      this.parseTwoBytes(firstByte, bits.readBits(8), cValues);
      for (let i = 0; i < 3; i++) {
        const cValue = cValues[i];
        switch (shift) {
          case 0:
            if (cValue < 3) {
              shift = cValue + 1;
            } else if (cValue < this.TEXT_BASIC_SET_CHARS.length) {
              const textChar = this.TEXT_BASIC_SET_CHARS[cValue];
              if (upperShift) {
                result.append(String.fromCharCode(textChar.charCodeAt(0) + 128));
                upperShift = false;
              } else {
                result.append(textChar);
              }
            } else {
              throw new FormatException();
            }
            break;
          case 1:
            if (upperShift) {
              result.append(String.fromCharCode(cValue + 128));
              upperShift = false;
            } else {
              result.append(String.fromCharCode(cValue));
            }
            shift = 0;
            break;
          case 2:
            if (cValue < this.TEXT_SHIFT2_SET_CHARS.length) {
              const textChar = this.TEXT_SHIFT2_SET_CHARS[cValue];
              if (upperShift) {
                result.append(String.fromCharCode(textChar.charCodeAt(0) + 128));
                upperShift = false;
              } else {
                result.append(textChar);
              }
            } else {
              switch (cValue) {
                case 27:
                  result.append(String.fromCharCode(29));
                  break;
                case 30:
                  upperShift = true;
                  break;
                default:
                  throw new FormatException();
              }
            }
            shift = 0;
            break;
          case 3:
            if (cValue < this.TEXT_SHIFT3_SET_CHARS.length) {
              const textChar = this.TEXT_SHIFT3_SET_CHARS[cValue];
              if (upperShift) {
                result.append(String.fromCharCode(textChar.charCodeAt(0) + 128));
                upperShift = false;
              } else {
                result.append(textChar);
              }
              shift = 0;
            } else {
              throw new FormatException();
            }
            break;
          default:
            throw new FormatException();
        }
      }
    } while (bits.available() > 0);
  }
  /**
   * See ISO 16022:2006, 5.2.7
   */
  static decodeAnsiX12Segment(bits, result) {
    const cValues = [];
    do {
      if (bits.available() === 8) {
        return;
      }
      const firstByte = bits.readBits(8);
      if (firstByte === 254) {
        return;
      }
      this.parseTwoBytes(firstByte, bits.readBits(8), cValues);
      for (let i = 0; i < 3; i++) {
        const cValue = cValues[i];
        switch (cValue) {
          case 0:
            result.append("\r");
            break;
          case 1:
            result.append("*");
            break;
          case 2:
            result.append(">");
            break;
          case 3:
            result.append(" ");
            break;
          default:
            if (cValue < 14) {
              result.append(String.fromCharCode(cValue + 44));
            } else if (cValue < 40) {
              result.append(String.fromCharCode(cValue + 51));
            } else {
              throw new FormatException();
            }
            break;
        }
      }
    } while (bits.available() > 0);
  }
  static parseTwoBytes(firstByte, secondByte, result) {
    let fullBitValue = (firstByte << 8) + secondByte - 1;
    let temp = Math.floor(fullBitValue / 1600);
    result[0] = temp;
    fullBitValue -= temp * 1600;
    temp = Math.floor(fullBitValue / 40);
    result[1] = temp;
    result[2] = fullBitValue - temp * 40;
  }
  /**
   * See ISO 16022:2006, 5.2.8 and Annex C Table C.3
   */
  static decodeEdifactSegment(bits, result) {
    do {
      if (bits.available() <= 16) {
        return;
      }
      for (let i = 0; i < 4; i++) {
        let edifactValue = bits.readBits(6);
        if (edifactValue === 31) {
          const bitsLeft = 8 - bits.getBitOffset();
          if (bitsLeft !== 8) {
            bits.readBits(bitsLeft);
          }
          return;
        }
        if ((edifactValue & 32) === 0) {
          edifactValue |= 64;
        }
        result.append(String.fromCharCode(edifactValue));
      }
    } while (bits.available() > 0);
  }
  /**
   * See ISO 16022:2006, 5.2.9 and Annex B, B.2
   */
  static decodeBase256Segment(bits, result, byteSegments) {
    let codewordPosition = 1 + bits.getByteOffset();
    const d1 = this.unrandomize255State(bits.readBits(8), codewordPosition++);
    let count;
    if (d1 === 0) {
      count = bits.available() / 8 | 0;
    } else if (d1 < 250) {
      count = d1;
    } else {
      count = 250 * (d1 - 249) + this.unrandomize255State(bits.readBits(8), codewordPosition++);
    }
    if (count < 0) {
      throw new FormatException();
    }
    const bytes = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
      if (bits.available() < 8) {
        throw new FormatException();
      }
      bytes[i] = this.unrandomize255State(bits.readBits(8), codewordPosition++);
    }
    byteSegments.push(bytes);
    try {
      result.append(ZXingStringEncoding.decode(bytes, StringUtils.ISO88591));
    } catch (uee) {
      throw new IllegalStateException("Platform does not support required encoding: " + uee.message);
    }
  }
  /**
   * See ISO 16022:2006, Annex B, B.2
   */
  static unrandomize255State(randomizedBase256Codeword, base256CodewordPosition) {
    const pseudoRandomNumber = 149 * base256CodewordPosition % 255 + 1;
    const tempVariable = randomizedBase256Codeword - pseudoRandomNumber;
    return tempVariable >= 0 ? tempVariable : tempVariable + 256;
  }
}

export { DataMatrixDecodedBitStreamParser };
//# sourceMappingURL=DataMatrixDecodedBitStreamParser.js.map
//# sourceMappingURL=DataMatrixDecodedBitStreamParser.js.map