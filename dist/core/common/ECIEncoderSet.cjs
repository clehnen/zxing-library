'use strict';

var ZXingCharset = require('../util/ZXingCharset');
var ZXingStandardCharsets = require('../util/ZXingStandardCharsets');
var ZXingStringEncoding = require('../util/ZXingStringEncoding');
var StringUtils = require('./StringUtils');

class CharsetEncoder {
  constructor(charset) {
    this.charset = charset;
    this.name = charset.name;
  }
  charset;
  name;
  canEncode(c) {
    try {
      return ZXingStringEncoding.ZXingStringEncoding.encode(c, this.charset) != null;
    } catch (ex) {
      return false;
    }
  }
}
class ECIEncoderSet {
  ENCODERS = [
    "IBM437",
    "ISO-8859-2",
    "ISO-8859-3",
    "ISO-8859-4",
    "ISO-8859-5",
    "ISO-8859-6",
    "ISO-8859-7",
    "ISO-8859-8",
    "ISO-8859-9",
    "ISO-8859-10",
    "ISO-8859-11",
    "ISO-8859-13",
    "ISO-8859-14",
    "ISO-8859-15",
    "ISO-8859-16",
    "windows-1250",
    "windows-1251",
    "windows-1252",
    "windows-1256",
    "Shift_JIS"
  ].map((name) => new CharsetEncoder(ZXingCharset.ZXingCharset.forName(name)));
  encoders = [];
  priorityEncoderIndex;
  /**
   * Constructs an encoder set
   *
   * @param stringToEncode the string that needs to be encoded
   * @param priorityCharset The preferred {@link ZXingCharset} or null.
   * @param fnc1 fnc1 denotes the character in the input that represents the FNC1 character or -1 for a non-GS1 bar
   * code. When specified, it is considered an error to pass it as argument to the methods canEncode() or encode().
   */
  constructor(stringToEncode, priorityCharset, fnc1) {
    const neededEncoders = [];
    neededEncoders.push(new CharsetEncoder(ZXingStandardCharsets.ZXingStandardCharsets.ISO_8859_1));
    let needUnicodeEncoder = priorityCharset != null && priorityCharset.name.startsWith("UTF");
    for (let i = 0; i < stringToEncode.length; i++) {
      let canEncode = false;
      for (const encoder of neededEncoders) {
        const singleCharacter = stringToEncode.charAt(i);
        const c = singleCharacter.charCodeAt(0);
        if (c === fnc1 || encoder.canEncode(singleCharacter)) {
          canEncode = true;
          break;
        }
      }
      if (!canEncode) {
        for (const encoder of this.ENCODERS) {
          if (encoder.canEncode(stringToEncode.charAt(i))) {
            neededEncoders.push(encoder);
            canEncode = true;
            break;
          }
        }
      }
      if (!canEncode) {
        needUnicodeEncoder = true;
      }
    }
    if (neededEncoders.length === 1 && !needUnicodeEncoder) {
      this.encoders = [neededEncoders[0]];
    } else {
      this.encoders = [];
      let index = 0;
      for (const encoder of neededEncoders) {
        this.encoders[index++] = encoder;
      }
    }
    let priorityEncoderIndexValue = -1;
    if (priorityCharset != null) {
      for (let i = 0; i < this.encoders.length; i++) {
        if (this.encoders[i] != null && priorityCharset.name === this.encoders[i].name) {
          priorityEncoderIndexValue = i;
          break;
        }
      }
    }
    this.priorityEncoderIndex = priorityEncoderIndexValue;
  }
  length() {
    return this.encoders.length;
  }
  getCharsetName(index) {
    if (!(index < this.length())) {
      throw new Error("index must be less than length");
    }
    return this.encoders[index].name;
  }
  getCharset(index) {
    if (!(index < this.length())) {
      throw new Error("index must be less than length");
    }
    return this.encoders[index].charset;
  }
  getECIValue(encoderIndex) {
    return this.encoders[encoderIndex].charset.getValueIdentifier();
  }
  /*
   *  returns -1 if no priority charset was defined
   */
  getPriorityEncoderIndex() {
    return this.priorityEncoderIndex;
  }
  canEncode(c, encoderIndex) {
    if (!(encoderIndex < this.length())) {
      throw new Error("index must be less than length");
    }
    return true;
  }
  encode(c, encoderIndex) {
    if (!(encoderIndex < this.length())) {
      throw new Error("index must be less than length");
    }
    return ZXingStringEncoding.ZXingStringEncoding.encode(
      StringUtils.StringUtils.getCharAt(c),
      this.encoders[encoderIndex].name
    );
  }
}

exports.ECIEncoderSet = ECIEncoderSet;
//# sourceMappingURL=ECIEncoderSet.cjs.map
//# sourceMappingURL=ECIEncoderSet.cjs.map