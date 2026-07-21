import { StringUtils } from '../common/StringUtils';

class ZXingStringBuilder {
  constructor(value = "") {
    this.value = value;
  }
  value;
  encoding;
  enableDecoding(encoding) {
    this.encoding = encoding;
    return this;
  }
  append(s) {
    if (typeof s === "string") {
      this.value += s.toString();
    } else if (this.encoding) {
      this.value += StringUtils.castAsNonUtf8Char(s, this.encoding);
    } else {
      this.value += String.fromCharCode(s);
    }
    return this;
  }
  appendChars(str, offset, len) {
    for (let i = offset; offset < offset + len; i++) {
      this.append(str[i]);
    }
    return this;
  }
  length() {
    return this.value.length;
  }
  charAt(n) {
    return this.value.charAt(n);
  }
  deleteCharAt(n) {
    this.value = this.value.substr(0, n) + this.value.substring(n + 1);
  }
  setCharAt(n, c) {
    this.value = this.value.substr(0, n) + c + this.value.substr(n + 1);
  }
  substring(start, end) {
    return this.value.substring(start, end);
  }
  /**
   * @note helper method for RSS Expanded
   */
  setLengthToZero() {
    this.value = "";
  }
  toString() {
    return this.value;
  }
  insert(n, c) {
    this.value = this.value.substring(0, n) + c + this.value.substring(n);
  }
}

export { ZXingStringBuilder };
//# sourceMappingURL=StringBuilder.js.map
//# sourceMappingURL=StringBuilder.js.map