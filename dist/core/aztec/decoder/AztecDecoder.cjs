'use strict';

var DecoderResult = require('../../common/DecoderResult');
var GenericGF = require('../../common/reedsolomon/GenericGF');
var ReedSolomonDecoder = require('../../common/reedsolomon/ReedSolomonDecoder');
var IllegalStateException = require('../../IllegalStateException');
var FormatException = require('../../FormatException');
var StringUtils = require('../../common/StringUtils');
var ZXingInteger = require('../../util/ZXingInteger');

class AztecDecoder {
  static UPPER_TABLE = [
    "CTRL_PS",
    " ",
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
    "CTRL_LL",
    "CTRL_ML",
    "CTRL_DL",
    "CTRL_BS"
  ];
  static LOWER_TABLE = [
    "CTRL_PS",
    " ",
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
    "z",
    "CTRL_US",
    "CTRL_ML",
    "CTRL_DL",
    "CTRL_BS"
  ];
  static MIXED_TABLE = [
    "CTRL_PS",
    " ",
    "",
    "",
    "",
    "",
    "",
    "",
    "\x07",
    "\b",
    "	",
    "\n",
    "\v",
    "\f",
    "\r",
    "\x1B",
    "",
    "",
    "",
    "",
    "@",
    "\\",
    "^",
    "_",
    "`",
    "|",
    "~",
    "\x7F",
    "CTRL_LL",
    "CTRL_UL",
    "CTRL_PL",
    "CTRL_BS"
  ];
  static PUNCT_TABLE = [
    "",
    "\r",
    "\r\n",
    ". ",
    ", ",
    ": ",
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
    "[",
    "]",
    "{",
    "}",
    "CTRL_UL"
  ];
  static DIGIT_TABLE = [
    "CTRL_PS",
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
    ",",
    ".",
    "CTRL_UL",
    "CTRL_US"
  ];
  ddata;
  decode(detectorResult) {
    this.ddata = detectorResult;
    let matrix = detectorResult.getBits();
    let rawbits = this.extractBits(matrix);
    let correctedBits = this.correctBits(rawbits);
    let rawBytes = AztecDecoder.convertBoolArrayToByteArray(correctedBits);
    let result = AztecDecoder.getEncodedData(correctedBits);
    let decoderResult = new DecoderResult.DecoderResult(rawBytes, result, null, null);
    decoderResult.setNumBits(correctedBits.length);
    return decoderResult;
  }
  // This method is used for testing the high-level encoder
  static highLevelDecode(correctedBits) {
    return this.getEncodedData(correctedBits);
  }
  /**
   * Gets the string encoded in the aztec code bits
   *
   * @return the decoded string
   */
  static getEncodedData(correctedBits) {
    let endIndex = correctedBits.length;
    let latchTable = 0 /* UPPER */;
    let shiftTable = 0 /* UPPER */;
    let result = "";
    let index = 0;
    while (index < endIndex) {
      if (shiftTable === 5 /* BINARY */) {
        if (endIndex - index < 5) {
          break;
        }
        let length = AztecDecoder.readCode(correctedBits, index, 5);
        index += 5;
        if (length === 0) {
          if (endIndex - index < 11) {
            break;
          }
          length = AztecDecoder.readCode(correctedBits, index, 11) + 31;
          index += 11;
        }
        for (let charCount = 0; charCount < length; charCount++) {
          if (endIndex - index < 8) {
            index = endIndex;
            break;
          }
          const code = AztecDecoder.readCode(correctedBits, index, 8);
          result += /*(char)*/
          StringUtils.StringUtils.castAsNonUtf8Char(code);
          index += 8;
        }
        shiftTable = latchTable;
      } else {
        let size = shiftTable === 3 /* DIGIT */ ? 4 : 5;
        if (endIndex - index < size) {
          break;
        }
        let code = AztecDecoder.readCode(correctedBits, index, size);
        index += size;
        let str = AztecDecoder.getCharacter(shiftTable, code);
        if (str.startsWith("CTRL_")) {
          latchTable = shiftTable;
          shiftTable = AztecDecoder.getTable(str.charAt(5));
          if (str.charAt(6) === "L") {
            latchTable = shiftTable;
          }
        } else {
          result += str;
          shiftTable = latchTable;
        }
      }
    }
    return result;
  }
  /**
   * gets the table corresponding to the char passed
   */
  static getTable(t) {
    switch (t) {
      case "L":
        return 1 /* LOWER */;
      case "P":
        return 4 /* PUNCT */;
      case "M":
        return 2 /* MIXED */;
      case "D":
        return 3 /* DIGIT */;
      case "B":
        return 5 /* BINARY */;
      case "U":
      default:
        return 0 /* UPPER */;
    }
  }
  /**
   * Gets the character (or string) corresponding to the passed code in the given table
   *
   * @param table the table used
   * @param code the code of the character
   */
  static getCharacter(table, code) {
    switch (table) {
      case 0 /* UPPER */:
        return AztecDecoder.UPPER_TABLE[code];
      case 1 /* LOWER */:
        return AztecDecoder.LOWER_TABLE[code];
      case 2 /* MIXED */:
        return AztecDecoder.MIXED_TABLE[code];
      case 4 /* PUNCT */:
        return AztecDecoder.PUNCT_TABLE[code];
      case 3 /* DIGIT */:
        return AztecDecoder.DIGIT_TABLE[code];
      default:
        throw new IllegalStateException.IllegalStateException("Bad table");
    }
  }
  /**
   * <p>Performs RS error correction on an array of bits.</p>
   *
   * @return the corrected array
   * @throws FormatException if the input contains too many errors
   */
  correctBits(rawbits) {
    let gf;
    let codewordSize;
    if (this.ddata.getNbLayers() <= 2) {
      codewordSize = 6;
      gf = GenericGF.GenericGF.AZTEC_DATA_6;
    } else if (this.ddata.getNbLayers() <= 8) {
      codewordSize = 8;
      gf = GenericGF.GenericGF.AZTEC_DATA_8;
    } else if (this.ddata.getNbLayers() <= 22) {
      codewordSize = 10;
      gf = GenericGF.GenericGF.AZTEC_DATA_10;
    } else {
      codewordSize = 12;
      gf = GenericGF.GenericGF.AZTEC_DATA_12;
    }
    let numDataCodewords = this.ddata.getNbDatablocks();
    let numCodewords = rawbits.length / codewordSize;
    if (numCodewords < numDataCodewords) {
      throw new FormatException.FormatException();
    }
    let offset = rawbits.length % codewordSize;
    let dataWords = new Int32Array(numCodewords);
    for (let i = 0; i < numCodewords; i++, offset += codewordSize) {
      dataWords[i] = AztecDecoder.readCode(rawbits, offset, codewordSize);
    }
    try {
      let rsDecoder = new ReedSolomonDecoder.ReedSolomonDecoder(gf);
      rsDecoder.decode(dataWords, numCodewords - numDataCodewords);
    } catch (ex) {
      throw new FormatException.FormatException(ex);
    }
    let mask = (1 << codewordSize) - 1;
    let stuffedBits = 0;
    for (let i = 0; i < numDataCodewords; i++) {
      let dataWord = dataWords[i];
      if (dataWord === 0 || dataWord === mask) {
        throw new FormatException.FormatException();
      } else if (dataWord === 1 || dataWord === mask - 1) {
        stuffedBits++;
      }
    }
    let correctedBits = new Array(numDataCodewords * codewordSize - stuffedBits);
    let index = 0;
    for (let i = 0; i < numDataCodewords; i++) {
      let dataWord = dataWords[i];
      if (dataWord === 1 || dataWord === mask - 1) {
        correctedBits.fill(dataWord > 1, index, index + codewordSize - 1);
        index += codewordSize - 1;
      } else {
        for (let bit = codewordSize - 1; bit >= 0; --bit) {
          correctedBits[index++] = (dataWord & 1 << bit) !== 0;
        }
      }
    }
    return correctedBits;
  }
  /**
   * Gets the array of bits from an Aztec Code matrix
   *
   * @return the array of bits
   */
  extractBits(matrix) {
    let compact = this.ddata.isCompact();
    let layers = this.ddata.getNbLayers();
    let baseMatrixSize = (compact ? 11 : 14) + layers * 4;
    let alignmentMap = new Int32Array(baseMatrixSize);
    let rawbits = new Array(this.totalBitsInLayer(layers, compact));
    if (compact) {
      for (let i = 0; i < alignmentMap.length; i++) {
        alignmentMap[i] = i;
      }
    } else {
      let matrixSize = baseMatrixSize + 1 + 2 * ZXingInteger.ZXingInteger.truncDivision(ZXingInteger.ZXingInteger.truncDivision(baseMatrixSize, 2) - 1, 15);
      let origCenter = baseMatrixSize / 2;
      let center = ZXingInteger.ZXingInteger.truncDivision(matrixSize, 2);
      for (let i = 0; i < origCenter; i++) {
        let newOffset = i + ZXingInteger.ZXingInteger.truncDivision(i, 15);
        alignmentMap[origCenter - i - 1] = center - newOffset - 1;
        alignmentMap[origCenter + i] = center + newOffset + 1;
      }
    }
    for (let i = 0, rowOffset = 0; i < layers; i++) {
      let rowSize = (layers - i) * 4 + (compact ? 9 : 12);
      let low = i * 2;
      let high = baseMatrixSize - 1 - low;
      for (let j = 0; j < rowSize; j++) {
        let columnOffset = j * 2;
        for (let k = 0; k < 2; k++) {
          rawbits[rowOffset + columnOffset + k] = matrix.get(alignmentMap[low + k], alignmentMap[low + j]);
          rawbits[rowOffset + 2 * rowSize + columnOffset + k] = matrix.get(alignmentMap[low + j], alignmentMap[high - k]);
          rawbits[rowOffset + 4 * rowSize + columnOffset + k] = matrix.get(alignmentMap[high - k], alignmentMap[high - j]);
          rawbits[rowOffset + 6 * rowSize + columnOffset + k] = matrix.get(alignmentMap[high - j], alignmentMap[low + k]);
        }
      }
      rowOffset += rowSize * 8;
    }
    return rawbits;
  }
  /**
   * Reads a code of given length and at given index in an array of bits
   */
  static readCode(rawbits, startIndex, length) {
    let res = 0;
    for (let i = startIndex; i < startIndex + length; i++) {
      res <<= 1;
      if (rawbits[i]) {
        res |= 1;
      }
    }
    return res;
  }
  /**
   * Reads a code of length 8 in an array of bits, padding with zeros
   */
  static readByte(rawbits, startIndex) {
    let n = rawbits.length - startIndex;
    if (n >= 8) {
      return AztecDecoder.readCode(rawbits, startIndex, 8);
    }
    return AztecDecoder.readCode(rawbits, startIndex, n) << 8 - n;
  }
  /**
   * Packs a bit array into bytes, most significant bit first
   */
  static convertBoolArrayToByteArray(boolArr) {
    let byteArr = new Uint8Array((boolArr.length + 7) / 8);
    for (let i = 0; i < byteArr.length; i++) {
      byteArr[i] = AztecDecoder.readByte(boolArr, 8 * i);
    }
    return byteArr;
  }
  totalBitsInLayer(layers, compact) {
    return ((compact ? 88 : 112) + 16 * layers) * layers;
  }
}

exports.AztecDecoder = AztecDecoder;
//# sourceMappingURL=AztecDecoder.cjs.map
//# sourceMappingURL=AztecDecoder.cjs.map