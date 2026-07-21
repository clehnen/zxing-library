'use strict';

var UnsupportedOperationException = require('../UnsupportedOperationException');
var CharacterSetECI = require('../common/CharacterSetECI');

class ZXingStringEncoding {
  /**
   * Allows the user to set a custom decoding function
   * so more encoding formats the native ones can be supported.
   */
  static customDecoder;
  /**
   * Allows the user to set a custom encoding function
   * so more encoding formats the native ones can be supported.
   */
  static customEncoder;
  /**
   * Decodes some Uint8Array to a string format.
   */
  static decode(bytes, encoding) {
    const encodingName = this.encodingName(encoding);
    if (this.customDecoder) {
      return this.customDecoder(bytes, encodingName);
    }
    if (typeof TextDecoder === "undefined" || this.shouldDecodeOnFallback(encodingName)) {
      return this.decodeFallback(bytes, encodingName);
    }
    return new TextDecoder(encodingName).decode(bytes);
  }
  /**
   * Checks if the decoding method should use the fallback for decoding.
   * Node.js 18+ supports ISO-8859-1 natively via TextDecoder, so no fallback
   * is needed for supported Node versions.
   *
   * @param encodingName
   */
  static shouldDecodeOnFallback(encodingName) {
    return false;
  }
  /**
   * Encodes some string into a Uint8Array.
   */
  static encode(s, encoding) {
    const encodingName = this.encodingName(encoding);
    if (this.customEncoder) {
      return this.customEncoder(s, encodingName);
    }
    if (typeof TextEncoder === "undefined") {
      return this.encodeFallback(s);
    }
    return new TextEncoder().encode(s);
  }
  static isBrowser() {
    return typeof window !== "undefined" && {}.toString.call(window) === "[object Window]";
  }
  /**
   * Returns the string value from some encoding character set.
   */
  static encodingName(encoding) {
    return typeof encoding === "string" ? encoding : encoding.getName();
  }
  /**
   * Returns character set from some encoding character set.
   */
  static encodingCharacterSet(encoding) {
    if (encoding instanceof CharacterSetECI.CharacterSetECI) {
      return encoding;
    }
    return CharacterSetECI.CharacterSetECI.getCharacterSetECIByName(encoding);
  }
  /**
   * Runs a fallback for the native decoding funcion.
   */
  static decodeFallback(bytes, encoding) {
    const characterSet = this.encodingCharacterSet(encoding);
    if (ZXingStringEncoding.isDecodeFallbackSupported(characterSet)) {
      let s = "";
      for (let i = 0, length = bytes.length; i < length; i++) {
        let h = bytes[i].toString(16);
        if (h.length < 2) {
          h = "0" + h;
        }
        s += "%" + h;
      }
      return decodeURIComponent(s);
    }
    if (characterSet.equals(CharacterSetECI.CharacterSetECI.UnicodeBigUnmarked)) {
      return String.fromCharCode.apply(null, Array.from(new Uint16Array(bytes.buffer)));
    }
    throw new UnsupportedOperationException.UnsupportedOperationException(`Encoding ${this.encodingName(encoding)} not supported by fallback.`);
  }
  static isDecodeFallbackSupported(characterSet) {
    return characterSet.equals(CharacterSetECI.CharacterSetECI.UTF8) || characterSet.equals(CharacterSetECI.CharacterSetECI.ISO8859_1) || characterSet.equals(CharacterSetECI.CharacterSetECI.ASCII);
  }
  /**
   * Runs a fallback for the native encoding funcion.
   *
   * @see https://stackoverflow.com/a/17192845/4367683
   */
  static encodeFallback(s) {
    const encodedURIstring = btoa(unescape(encodeURIComponent(s)));
    const charList = encodedURIstring.split("");
    const uintArray = [];
    for (let i = 0; i < charList.length; i++) {
      uintArray.push(charList[i].charCodeAt(0));
    }
    return new Uint8Array(uintArray);
  }
}

exports.ZXingStringEncoding = ZXingStringEncoding;
//# sourceMappingURL=ZXingStringEncoding.cjs.map
//# sourceMappingURL=ZXingStringEncoding.cjs.map