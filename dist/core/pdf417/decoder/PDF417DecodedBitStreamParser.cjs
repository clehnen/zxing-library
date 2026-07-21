'use strict';

var FormatException = require('../../FormatException');
var CharacterSetECI = require('../../common/CharacterSetECI');
var DecoderResult = require('../../common/DecoderResult');
var PDF417ResultMetadata = require('../PDF417ResultMetadata');
var ZXingArrays = require('../../util/ZXingArrays');
var StringBuilder = require('../../util/StringBuilder');
var ZXingInteger = require('../../util/ZXingInteger');
var Long = require('../../util/Long');
var ByteArrayOutputStream = require('../../util/ByteArrayOutputStream');
var ZXingStringEncoding = require('../../util/ZXingStringEncoding');

function getBigIntConstructor() {
  if (typeof window !== "undefined") {
    return window["BigInt"] || null;
  }
  if (typeof globalThis !== "undefined") {
    return globalThis["BigInt"] || null;
  }
  if (typeof self !== "undefined") {
    return self["BigInt"] || null;
  }
  throw new Error("Can't search globals for BigInt!");
}
let BigInteger;
function createBigInt(num) {
  if (typeof BigInteger === "undefined") {
    BigInteger = getBigIntConstructor();
  }
  if (BigInteger === null) {
    throw new Error("BigInt is not supported!");
  }
  return BigInteger(num);
}
function getEXP900() {
  let EXP900 = [];
  EXP900[0] = createBigInt(1);
  let nineHundred = createBigInt(900);
  EXP900[1] = nineHundred;
  for (let i = 2; i < 16; i++) {
    EXP900[i] = EXP900[i - 1] * nineHundred;
  }
  return EXP900;
}
class PDF417DecodedBitStreamParser {
  static TEXT_COMPACTION_MODE_LATCH = 900;
  static BYTE_COMPACTION_MODE_LATCH = 901;
  static NUMERIC_COMPACTION_MODE_LATCH = 902;
  static BYTE_COMPACTION_MODE_LATCH_6 = 924;
  static ECI_USER_DEFINED = 925;
  static ECI_GENERAL_PURPOSE = 926;
  static ECI_CHARSET = 927;
  static BEGIN_MACRO_PDF417_CONTROL_BLOCK = 928;
  static BEGIN_MACRO_PDF417_OPTIONAL_FIELD = 923;
  static MACRO_PDF417_TERMINATOR = 922;
  static MODE_SHIFT_TO_BYTE_COMPACTION_MODE = 913;
  static MAX_NUMERIC_CODEWORDS = 15;
  static MACRO_PDF417_OPTIONAL_FIELD_FILE_NAME = 0;
  static MACRO_PDF417_OPTIONAL_FIELD_SEGMENT_COUNT = 1;
  static MACRO_PDF417_OPTIONAL_FIELD_TIME_STAMP = 2;
  static MACRO_PDF417_OPTIONAL_FIELD_SENDER = 3;
  static MACRO_PDF417_OPTIONAL_FIELD_ADDRESSEE = 4;
  static MACRO_PDF417_OPTIONAL_FIELD_FILE_SIZE = 5;
  static MACRO_PDF417_OPTIONAL_FIELD_CHECKSUM = 6;
  static PL = 25;
  static LL = 27;
  static AS = 27;
  static ML = 28;
  static AL = 28;
  static PS = 29;
  static PAL = 29;
  static PUNCT_CHARS = ";<>@[\\]_`~!\r	,:\n-.$/\"|*()?{}'";
  static MIXED_CHARS = "0123456789&\r	,:#-.$/+%*=^";
  /**
   * Table containing values for the exponent of 900.
   * This is used in the numeric compaction decode algorithm.
   */
  static EXP900 = getBigIntConstructor() ? getEXP900() : [];
  static NUMBER_OF_SEQUENCE_CODEWORDS = 2;
  //   private DecodedBitStreamParser() {
  // }
  /**
   *
   * @param codewords
   * @param ecLevel
   *
   * @throws FormatException
   */
  static decode(codewords, ecLevel) {
    let result = new StringBuilder.ZXingStringBuilder("");
    let encoding = CharacterSetECI.CharacterSetECI.ISO8859_1;
    result.enableDecoding(encoding);
    let codeIndex = 1;
    let code = codewords[codeIndex++];
    let resultMetadata = new PDF417ResultMetadata.PDF417ResultMetadata();
    while (codeIndex < codewords[0]) {
      switch (code) {
        case PDF417DecodedBitStreamParser.TEXT_COMPACTION_MODE_LATCH:
          codeIndex = PDF417DecodedBitStreamParser.textCompaction(codewords, codeIndex, result);
          break;
        case PDF417DecodedBitStreamParser.BYTE_COMPACTION_MODE_LATCH:
        case PDF417DecodedBitStreamParser.BYTE_COMPACTION_MODE_LATCH_6:
          codeIndex = PDF417DecodedBitStreamParser.byteCompaction(code, codewords, encoding, codeIndex, result);
          break;
        case PDF417DecodedBitStreamParser.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:
          result.append(
            /*(char)*/
            codewords[codeIndex++]
          );
          break;
        case PDF417DecodedBitStreamParser.NUMERIC_COMPACTION_MODE_LATCH:
          codeIndex = PDF417DecodedBitStreamParser.numericCompaction(codewords, codeIndex, result);
          break;
        case PDF417DecodedBitStreamParser.ECI_CHARSET:
          CharacterSetECI.CharacterSetECI.getCharacterSetECIByValue(codewords[codeIndex++]);
          break;
        case PDF417DecodedBitStreamParser.ECI_GENERAL_PURPOSE:
          codeIndex += 2;
          break;
        case PDF417DecodedBitStreamParser.ECI_USER_DEFINED:
          codeIndex++;
          break;
        case PDF417DecodedBitStreamParser.BEGIN_MACRO_PDF417_CONTROL_BLOCK:
          codeIndex = PDF417DecodedBitStreamParser.decodeMacroBlock(codewords, codeIndex, resultMetadata);
          break;
        case PDF417DecodedBitStreamParser.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:
        case PDF417DecodedBitStreamParser.MACRO_PDF417_TERMINATOR:
          throw new FormatException.FormatException();
        default:
          codeIndex--;
          codeIndex = PDF417DecodedBitStreamParser.textCompaction(codewords, codeIndex, result);
          break;
      }
      if (codeIndex < codewords.length) {
        code = codewords[codeIndex++];
      } else {
        throw FormatException.FormatException.getFormatInstance();
      }
    }
    if (result.length() === 0) {
      throw FormatException.FormatException.getFormatInstance();
    }
    let decoderResult = new DecoderResult.DecoderResult(null, result.toString(), null, ecLevel);
    decoderResult.setOther(resultMetadata);
    return decoderResult;
  }
  /**
   *
   * @param int
   * @param param1
   * @param codewords
   * @param int
   * @param codeIndex
   * @param PDF417ResultMetadata
   * @param resultMetadata
   *
   * @throws FormatException
   */
  // @SuppressWarnings("deprecation")
  static decodeMacroBlock(codewords, codeIndex, resultMetadata) {
    if (codeIndex + PDF417DecodedBitStreamParser.NUMBER_OF_SEQUENCE_CODEWORDS > codewords[0]) {
      throw FormatException.FormatException.getFormatInstance();
    }
    let segmentIndexArray = new Int32Array(PDF417DecodedBitStreamParser.NUMBER_OF_SEQUENCE_CODEWORDS);
    for (let i = 0; i < PDF417DecodedBitStreamParser.NUMBER_OF_SEQUENCE_CODEWORDS; i++, codeIndex++) {
      segmentIndexArray[i] = codewords[codeIndex];
    }
    resultMetadata.setSegmentIndex(ZXingInteger.ZXingInteger.parseInt(PDF417DecodedBitStreamParser.decodeBase900toBase10(
      segmentIndexArray,
      PDF417DecodedBitStreamParser.NUMBER_OF_SEQUENCE_CODEWORDS
    )));
    let fileId = new StringBuilder.ZXingStringBuilder();
    codeIndex = PDF417DecodedBitStreamParser.textCompaction(codewords, codeIndex, fileId);
    resultMetadata.setFileId(fileId.toString());
    let optionalFieldsStart = -1;
    if (codewords[codeIndex] === PDF417DecodedBitStreamParser.BEGIN_MACRO_PDF417_OPTIONAL_FIELD) {
      optionalFieldsStart = codeIndex + 1;
    }
    while (codeIndex < codewords[0]) {
      switch (codewords[codeIndex]) {
        case PDF417DecodedBitStreamParser.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:
          codeIndex++;
          switch (codewords[codeIndex]) {
            case PDF417DecodedBitStreamParser.MACRO_PDF417_OPTIONAL_FIELD_FILE_NAME:
              let fileName = new StringBuilder.ZXingStringBuilder();
              codeIndex = PDF417DecodedBitStreamParser.textCompaction(codewords, codeIndex + 1, fileName);
              resultMetadata.setFileName(fileName.toString());
              break;
            case PDF417DecodedBitStreamParser.MACRO_PDF417_OPTIONAL_FIELD_SENDER:
              let sender = new StringBuilder.ZXingStringBuilder();
              codeIndex = PDF417DecodedBitStreamParser.textCompaction(codewords, codeIndex + 1, sender);
              resultMetadata.setSender(sender.toString());
              break;
            case PDF417DecodedBitStreamParser.MACRO_PDF417_OPTIONAL_FIELD_ADDRESSEE:
              let addressee = new StringBuilder.ZXingStringBuilder();
              codeIndex = PDF417DecodedBitStreamParser.textCompaction(codewords, codeIndex + 1, addressee);
              resultMetadata.setAddressee(addressee.toString());
              break;
            case PDF417DecodedBitStreamParser.MACRO_PDF417_OPTIONAL_FIELD_SEGMENT_COUNT:
              let segmentCount = new StringBuilder.ZXingStringBuilder();
              codeIndex = PDF417DecodedBitStreamParser.numericCompaction(codewords, codeIndex + 1, segmentCount);
              resultMetadata.setSegmentCount(ZXingInteger.ZXingInteger.parseInt(segmentCount.toString()));
              break;
            case PDF417DecodedBitStreamParser.MACRO_PDF417_OPTIONAL_FIELD_TIME_STAMP:
              let timestamp = new StringBuilder.ZXingStringBuilder();
              codeIndex = PDF417DecodedBitStreamParser.numericCompaction(codewords, codeIndex + 1, timestamp);
              resultMetadata.setTimestamp(Long.Long.parseLong(timestamp.toString()));
              break;
            case PDF417DecodedBitStreamParser.MACRO_PDF417_OPTIONAL_FIELD_CHECKSUM:
              let checksum = new StringBuilder.ZXingStringBuilder();
              codeIndex = PDF417DecodedBitStreamParser.numericCompaction(codewords, codeIndex + 1, checksum);
              resultMetadata.setChecksum(ZXingInteger.ZXingInteger.parseInt(checksum.toString()));
              break;
            case PDF417DecodedBitStreamParser.MACRO_PDF417_OPTIONAL_FIELD_FILE_SIZE:
              let fileSize = new StringBuilder.ZXingStringBuilder();
              codeIndex = PDF417DecodedBitStreamParser.numericCompaction(codewords, codeIndex + 1, fileSize);
              resultMetadata.setFileSize(Long.Long.parseLong(fileSize.toString()));
              break;
            default:
              throw FormatException.FormatException.getFormatInstance();
          }
          break;
        case PDF417DecodedBitStreamParser.MACRO_PDF417_TERMINATOR:
          codeIndex++;
          resultMetadata.setLastSegment(true);
          break;
        default:
          throw FormatException.FormatException.getFormatInstance();
      }
    }
    if (optionalFieldsStart !== -1) {
      let optionalFieldsLength = codeIndex - optionalFieldsStart;
      if (resultMetadata.isLastSegment()) {
        optionalFieldsLength--;
      }
      resultMetadata.setOptionalData(ZXingArrays.ZXingArrays.copyOfRange(codewords, optionalFieldsStart, optionalFieldsStart + optionalFieldsLength));
    }
    return codeIndex;
  }
  /**
   * Text Compaction mode (see 5.4.1.5) permits all printable ASCII characters to be
   * encoded, i.e. values 32 - 126 inclusive in accordance with ISO/IEC 646 (IRV), as
   * well as selected control characters.
   *
   * @param codewords The array of codewords (data + error)
   * @param codeIndex The current index into the codeword array.
   * @param result    The decoded data is appended to the result.
   * @return The next index into the codeword array.
   */
  static textCompaction(codewords, codeIndex, result) {
    let textCompactionData = new Int32Array((codewords[0] - codeIndex) * 2);
    let byteCompactionData = new Int32Array((codewords[0] - codeIndex) * 2);
    let index = 0;
    let end = false;
    while (codeIndex < codewords[0] && !end) {
      let code = codewords[codeIndex++];
      if (code < PDF417DecodedBitStreamParser.TEXT_COMPACTION_MODE_LATCH) {
        textCompactionData[index] = code / 30;
        textCompactionData[index + 1] = code % 30;
        index += 2;
      } else {
        switch (code) {
          case PDF417DecodedBitStreamParser.TEXT_COMPACTION_MODE_LATCH:
            textCompactionData[index++] = PDF417DecodedBitStreamParser.TEXT_COMPACTION_MODE_LATCH;
            break;
          case PDF417DecodedBitStreamParser.BYTE_COMPACTION_MODE_LATCH:
          case PDF417DecodedBitStreamParser.BYTE_COMPACTION_MODE_LATCH_6:
          case PDF417DecodedBitStreamParser.NUMERIC_COMPACTION_MODE_LATCH:
          case PDF417DecodedBitStreamParser.BEGIN_MACRO_PDF417_CONTROL_BLOCK:
          case PDF417DecodedBitStreamParser.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:
          case PDF417DecodedBitStreamParser.MACRO_PDF417_TERMINATOR:
            codeIndex--;
            end = true;
            break;
          case PDF417DecodedBitStreamParser.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:
            textCompactionData[index] = PDF417DecodedBitStreamParser.MODE_SHIFT_TO_BYTE_COMPACTION_MODE;
            code = codewords[codeIndex++];
            byteCompactionData[index] = code;
            index++;
            break;
        }
      }
    }
    PDF417DecodedBitStreamParser.decodeTextCompaction(textCompactionData, byteCompactionData, index, result);
    return codeIndex;
  }
  /**
   * The Text Compaction mode includes all the printable ASCII characters
   * (i.e. values from 32 to 126) and three ASCII control characters: HT or tab
   * (9: e), LF or line feed (10: e), and CR or carriage
   * return (13: e). The Text Compaction mode also includes various latch
   * and shift characters which are used exclusively within the mode. The Text
   * Compaction mode encodes up to 2 characters per codeword. The compaction rules
   * for converting data into PDF417 codewords are defined in 5.4.2.2. The sub-mode
   * switches are defined in 5.4.2.3.
   *
   * @param textCompactionData The text compaction data.
   * @param byteCompactionData The byte compaction data if there
   *                           was a mode shift.
   * @param length             The size of the text compaction and byte compaction data.
   * @param result             The decoded data is appended to the result.
   */
  static decodeTextCompaction(textCompactionData, byteCompactionData, length, result) {
    let subMode = 0 /* ALPHA */;
    let priorToShiftMode = 0 /* ALPHA */;
    let i = 0;
    while (i < length) {
      let subModeCh = textCompactionData[i];
      let ch = "";
      switch (subMode) {
        case 0 /* ALPHA */:
          if (subModeCh < 26) {
            ch = /*(char)('A' + subModeCh) */
            String.fromCharCode(65 + subModeCh);
          } else {
            switch (subModeCh) {
              case 26:
                ch = " ";
                break;
              case PDF417DecodedBitStreamParser.LL:
                subMode = 1 /* LOWER */;
                break;
              case PDF417DecodedBitStreamParser.ML:
                subMode = 2 /* MIXED */;
                break;
              case PDF417DecodedBitStreamParser.PS:
                priorToShiftMode = subMode;
                subMode = 5 /* PUNCT_SHIFT */;
                break;
              case PDF417DecodedBitStreamParser.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:
                result.append(
                  /*(char)*/
                  byteCompactionData[i]
                );
                break;
              case PDF417DecodedBitStreamParser.TEXT_COMPACTION_MODE_LATCH:
                subMode = 0 /* ALPHA */;
                break;
            }
          }
          break;
        case 1 /* LOWER */:
          if (subModeCh < 26) {
            ch = /*(char)('a' + subModeCh)*/
            String.fromCharCode(97 + subModeCh);
          } else {
            switch (subModeCh) {
              case 26:
                ch = " ";
                break;
              case PDF417DecodedBitStreamParser.AS:
                priorToShiftMode = subMode;
                subMode = 4 /* ALPHA_SHIFT */;
                break;
              case PDF417DecodedBitStreamParser.ML:
                subMode = 2 /* MIXED */;
                break;
              case PDF417DecodedBitStreamParser.PS:
                priorToShiftMode = subMode;
                subMode = 5 /* PUNCT_SHIFT */;
                break;
              case PDF417DecodedBitStreamParser.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:
                result.append(
                  /*(char)*/
                  byteCompactionData[i]
                );
                break;
              case PDF417DecodedBitStreamParser.TEXT_COMPACTION_MODE_LATCH:
                subMode = 0 /* ALPHA */;
                break;
            }
          }
          break;
        case 2 /* MIXED */:
          if (subModeCh < PDF417DecodedBitStreamParser.PL) {
            ch = PDF417DecodedBitStreamParser.MIXED_CHARS[subModeCh];
          } else {
            switch (subModeCh) {
              case PDF417DecodedBitStreamParser.PL:
                subMode = 3 /* PUNCT */;
                break;
              case 26:
                ch = " ";
                break;
              case PDF417DecodedBitStreamParser.LL:
                subMode = 1 /* LOWER */;
                break;
              case PDF417DecodedBitStreamParser.AL:
                subMode = 0 /* ALPHA */;
                break;
              case PDF417DecodedBitStreamParser.PS:
                priorToShiftMode = subMode;
                subMode = 5 /* PUNCT_SHIFT */;
                break;
              case PDF417DecodedBitStreamParser.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:
                result.append(
                  /*(char)*/
                  byteCompactionData[i]
                );
                break;
              case PDF417DecodedBitStreamParser.TEXT_COMPACTION_MODE_LATCH:
                subMode = 0 /* ALPHA */;
                break;
            }
          }
          break;
        case 3 /* PUNCT */:
          if (subModeCh < PDF417DecodedBitStreamParser.PAL) {
            ch = PDF417DecodedBitStreamParser.PUNCT_CHARS[subModeCh];
          } else {
            switch (subModeCh) {
              case PDF417DecodedBitStreamParser.PAL:
                subMode = 0 /* ALPHA */;
                break;
              case PDF417DecodedBitStreamParser.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:
                result.append(
                  /*(char)*/
                  byteCompactionData[i]
                );
                break;
              case PDF417DecodedBitStreamParser.TEXT_COMPACTION_MODE_LATCH:
                subMode = 0 /* ALPHA */;
                break;
            }
          }
          break;
        case 4 /* ALPHA_SHIFT */:
          subMode = priorToShiftMode;
          if (subModeCh < 26) {
            ch = /*(char)('A' + subModeCh)*/
            String.fromCharCode(65 + subModeCh);
          } else {
            switch (subModeCh) {
              case 26:
                ch = " ";
                break;
              case PDF417DecodedBitStreamParser.TEXT_COMPACTION_MODE_LATCH:
                subMode = 0 /* ALPHA */;
                break;
            }
          }
          break;
        case 5 /* PUNCT_SHIFT */:
          subMode = priorToShiftMode;
          if (subModeCh < PDF417DecodedBitStreamParser.PAL) {
            ch = PDF417DecodedBitStreamParser.PUNCT_CHARS[subModeCh];
          } else {
            switch (subModeCh) {
              case PDF417DecodedBitStreamParser.PAL:
                subMode = 0 /* ALPHA */;
                break;
              case PDF417DecodedBitStreamParser.MODE_SHIFT_TO_BYTE_COMPACTION_MODE:
                result.append(
                  /*(char)*/
                  byteCompactionData[i]
                );
                break;
              case PDF417DecodedBitStreamParser.TEXT_COMPACTION_MODE_LATCH:
                subMode = 0 /* ALPHA */;
                break;
            }
          }
          break;
      }
      if (ch !== "") {
        result.append(ch);
      }
      i++;
    }
  }
  /**
   * Byte Compaction mode (see 5.4.3) permits all 256 possible 8-bit byte values to be encoded.
   * This includes all ASCII characters value 0 to 127 inclusive and provides for international
   * character set support.
   *
   * @param mode      The byte compaction mode i.e. 901 or 924
   * @param codewords The array of codewords (data + error)
   * @param encoding  Currently active character encoding
   * @param codeIndex The current index into the codeword array.
   * @param result    The decoded data is appended to the result.
   * @return The next index into the codeword array.
   */
  static byteCompaction(mode, codewords, encoding, codeIndex, result) {
    let decodedBytes = new ByteArrayOutputStream.ByteArrayOutputStream();
    let count = 0;
    let value = 0;
    let end = false;
    switch (mode) {
      case PDF417DecodedBitStreamParser.BYTE_COMPACTION_MODE_LATCH:
        let byteCompactedCodewords = new Int32Array(6);
        let nextCode = codewords[codeIndex++];
        while (codeIndex < codewords[0] && !end) {
          byteCompactedCodewords[count++] = nextCode;
          value = 900 * value + nextCode;
          nextCode = codewords[codeIndex++];
          switch (nextCode) {
            case PDF417DecodedBitStreamParser.TEXT_COMPACTION_MODE_LATCH:
            case PDF417DecodedBitStreamParser.BYTE_COMPACTION_MODE_LATCH:
            case PDF417DecodedBitStreamParser.NUMERIC_COMPACTION_MODE_LATCH:
            case PDF417DecodedBitStreamParser.BYTE_COMPACTION_MODE_LATCH_6:
            case PDF417DecodedBitStreamParser.BEGIN_MACRO_PDF417_CONTROL_BLOCK:
            case PDF417DecodedBitStreamParser.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:
            case PDF417DecodedBitStreamParser.MACRO_PDF417_TERMINATOR:
              codeIndex--;
              end = true;
              break;
            default:
              if (count % 5 === 0 && count > 0) {
                for (let j = 0; j < 6; ++j) {
                  decodedBytes.write(
                    /*(byte)*/
                    Number(createBigInt(value) >> createBigInt(8 * (5 - j)))
                  );
                }
                value = 0;
                count = 0;
              }
              break;
          }
        }
        if (codeIndex === codewords[0] && nextCode < PDF417DecodedBitStreamParser.TEXT_COMPACTION_MODE_LATCH) {
          byteCompactedCodewords[count++] = nextCode;
        }
        for (let i = 0; i < count; i++) {
          decodedBytes.write(
            /*(byte)*/
            byteCompactedCodewords[i]
          );
        }
        break;
      case PDF417DecodedBitStreamParser.BYTE_COMPACTION_MODE_LATCH_6:
        while (codeIndex < codewords[0] && !end) {
          let code = codewords[codeIndex++];
          if (code < PDF417DecodedBitStreamParser.TEXT_COMPACTION_MODE_LATCH) {
            count++;
            value = 900 * value + code;
          } else {
            switch (code) {
              case PDF417DecodedBitStreamParser.TEXT_COMPACTION_MODE_LATCH:
              case PDF417DecodedBitStreamParser.BYTE_COMPACTION_MODE_LATCH:
              case PDF417DecodedBitStreamParser.NUMERIC_COMPACTION_MODE_LATCH:
              case PDF417DecodedBitStreamParser.BYTE_COMPACTION_MODE_LATCH_6:
              case PDF417DecodedBitStreamParser.BEGIN_MACRO_PDF417_CONTROL_BLOCK:
              case PDF417DecodedBitStreamParser.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:
              case PDF417DecodedBitStreamParser.MACRO_PDF417_TERMINATOR:
                codeIndex--;
                end = true;
                break;
            }
          }
          if (count % 5 === 0 && count > 0) {
            for (let j = 0; j < 6; ++j) {
              decodedBytes.write(
                /*(byte)*/
                Number(createBigInt(value) >> createBigInt(8 * (5 - j)))
              );
            }
            value = 0;
            count = 0;
          }
        }
        break;
    }
    result.append(ZXingStringEncoding.ZXingStringEncoding.decode(decodedBytes.toByteArray(), encoding));
    return codeIndex;
  }
  /**
   * Numeric Compaction mode (see 5.4.4) permits efficient encoding of numeric data strings.
   *
   * @param codewords The array of codewords (data + error)
   * @param codeIndex The current index into the codeword array.
   * @param result    The decoded data is appended to the result.
   * @return The next index into the codeword array.
   *
   * @throws FormatException
   */
  static numericCompaction(codewords, codeIndex, result) {
    let count = 0;
    let end = false;
    let numericCodewords = new Int32Array(PDF417DecodedBitStreamParser.MAX_NUMERIC_CODEWORDS);
    while (codeIndex < codewords[0] && !end) {
      let code = codewords[codeIndex++];
      if (codeIndex === codewords[0]) {
        end = true;
      }
      if (code < PDF417DecodedBitStreamParser.TEXT_COMPACTION_MODE_LATCH) {
        numericCodewords[count] = code;
        count++;
      } else {
        switch (code) {
          case PDF417DecodedBitStreamParser.TEXT_COMPACTION_MODE_LATCH:
          case PDF417DecodedBitStreamParser.BYTE_COMPACTION_MODE_LATCH:
          case PDF417DecodedBitStreamParser.BYTE_COMPACTION_MODE_LATCH_6:
          case PDF417DecodedBitStreamParser.BEGIN_MACRO_PDF417_CONTROL_BLOCK:
          case PDF417DecodedBitStreamParser.BEGIN_MACRO_PDF417_OPTIONAL_FIELD:
          case PDF417DecodedBitStreamParser.MACRO_PDF417_TERMINATOR:
            codeIndex--;
            end = true;
            break;
        }
      }
      if ((count % PDF417DecodedBitStreamParser.MAX_NUMERIC_CODEWORDS === 0 || code === PDF417DecodedBitStreamParser.NUMERIC_COMPACTION_MODE_LATCH || end) && count > 0) {
        result.append(PDF417DecodedBitStreamParser.decodeBase900toBase10(numericCodewords, count));
        count = 0;
      }
    }
    return codeIndex;
  }
  /**
   * Convert a list of Numeric Compacted codewords from Base 900 to Base 10.
   *
   * @param codewords The array of codewords
   * @param count     The number of codewords
   * @return The decoded string representing the Numeric data.
   *
   * EXAMPLE
   * Encode the fifteen digit numeric string 000213298174000
   * Prefix the numeric string with a 1 and set the initial value of
   * t = 1 000 213 298 174 000
   * Calculate codeword 0
   * d0 = 1 000 213 298 174 000 mod 900 = 200
   *
   * t = 1 000 213 298 174 000 div 900 = 1 111 348 109 082
   * Calculate codeword 1
   * d1 = 1 111 348 109 082 mod 900 = 282
   *
   * t = 1 111 348 109 082 div 900 = 1 234 831 232
   * Calculate codeword 2
   * d2 = 1 234 831 232 mod 900 = 632
   *
   * t = 1 234 831 232 div 900 = 1 372 034
   * Calculate codeword 3
   * d3 = 1 372 034 mod 900 = 434
   *
   * t = 1 372 034 div 900 = 1 524
   * Calculate codeword 4
   * d4 = 1 524 mod 900 = 624
   *
   * t = 1 524 div 900 = 1
   * Calculate codeword 5
   * d5 = 1 mod 900 = 1
   * t = 1 div 900 = 0
   * Codeword sequence is: 1, 624, 434, 632, 282, 200
   *
   * Decode the above codewords involves
   *   1 x 900 power of 5 + 624 x 900 power of 4 + 434 x 900 power of 3 +
   * 632 x 900 power of 2 + 282 x 900 power of 1 + 200 x 900 power of 0 = 1000213298174000
   *
   * Remove leading 1 =>  Result is 000213298174000
   *
   * @throws FormatException
   */
  static decodeBase900toBase10(codewords, count) {
    let result = createBigInt(0);
    for (let i = 0; i < count; i++) {
      result += PDF417DecodedBitStreamParser.EXP900[count - i - 1] * createBigInt(codewords[i]);
    }
    let resultString = result.toString();
    if (resultString.charAt(0) !== "1") {
      throw new FormatException.FormatException();
    }
    return resultString.substring(1);
  }
}

exports.PDF417DecodedBitStreamParser = PDF417DecodedBitStreamParser;
//# sourceMappingURL=PDF417DecodedBitStreamParser.cjs.map
//# sourceMappingURL=PDF417DecodedBitStreamParser.cjs.map