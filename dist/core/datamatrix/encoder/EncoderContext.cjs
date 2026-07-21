'use strict';

var StringBuilder = require('../../util/StringBuilder');
var constants = require('./constants');
var DataMatrixSymbolInfo = require('./DataMatrixSymbolInfo');

class EncoderContext {
  constructor(msg) {
    this.msg = msg;
    const msgBinary = msg.split("").map((c) => c.charCodeAt(0));
    const sb = new StringBuilder.ZXingStringBuilder();
    for (let i = 0, c = msgBinary.length; i < c; i++) {
      const ch = String.fromCharCode(msgBinary[i] & 255);
      if (ch === "?" && msg.charAt(i) !== "?") {
        throw new Error(
          "Message contains characters outside ISO-8859-1 encoding."
        );
      }
      sb.append(ch);
    }
    this.msg = sb.toString();
    this.shape = constants.SymbolShapeHint.FORCE_NONE;
    this.codewords = new StringBuilder.ZXingStringBuilder();
    this.newEncoding = -1;
  }
  msg;
  shape;
  minSize;
  maxSize;
  codewords;
  pos = 0;
  newEncoding;
  symbolInfo;
  skipAtEnd = 0;
  setSymbolShape(shape) {
    this.shape = shape;
  }
  setSizeConstraints(minSize, maxSize) {
    this.minSize = minSize;
    this.maxSize = maxSize;
  }
  getMessage() {
    return this.msg;
  }
  setSkipAtEnd(count) {
    this.skipAtEnd = count;
  }
  getCurrentChar() {
    return this.msg.charCodeAt(this.pos);
  }
  getCurrent() {
    return this.msg.charCodeAt(this.pos);
  }
  getCodewords() {
    return this.codewords;
  }
  writeCodewords(codewords) {
    this.codewords.append(codewords);
  }
  writeCodeword(codeword) {
    this.codewords.append(codeword);
  }
  getCodewordCount() {
    return this.codewords.length();
  }
  getNewEncoding() {
    return this.newEncoding;
  }
  signalEncoderChange(encoding) {
    this.newEncoding = encoding;
  }
  resetEncoderSignal() {
    this.newEncoding = -1;
  }
  hasMoreCharacters() {
    return this.pos < this.getTotalMessageCharCount();
  }
  getTotalMessageCharCount() {
    return this.msg.length - this.skipAtEnd;
  }
  getRemainingCharacters() {
    return this.getTotalMessageCharCount() - this.pos;
  }
  getSymbolInfo() {
    return this.symbolInfo;
  }
  updateSymbolInfo(len = this.getCodewordCount()) {
    if (this.symbolInfo == null || len > this.symbolInfo.getDataCapacity()) {
      this.symbolInfo = DataMatrixSymbolInfo.DataMatrixSymbolInfo.lookup(
        len,
        this.shape,
        this.minSize,
        this.maxSize,
        true
      );
    }
  }
  resetSymbolInfo() {
    this.symbolInfo = null;
  }
}

exports.EncoderContext = EncoderContext;
//# sourceMappingURL=EncoderContext.cjs.map
//# sourceMappingURL=EncoderContext.cjs.map