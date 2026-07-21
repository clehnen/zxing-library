import { C40Encoder } from './C40Encoder';
import { TEXT_ENCODATION } from './constants';

class TextEncoder extends C40Encoder {
  getEncodingMode() {
    return TEXT_ENCODATION;
  }
  encodeChar(c, sb) {
    if (c === " ".charCodeAt(0)) {
      sb.append(3);
      return 1;
    }
    if (c >= "0".charCodeAt(0) && c <= "9".charCodeAt(0)) {
      sb.append(c - 48 + 4);
      return 1;
    }
    if (c >= "a".charCodeAt(0) && c <= "z".charCodeAt(0)) {
      sb.append(c - 97 + 14);
      return 1;
    }
    if (c < " ".charCodeAt(0)) {
      sb.append(0);
      sb.append(c);
      return 2;
    }
    if (c <= "/".charCodeAt(0)) {
      sb.append(1);
      sb.append(c - 33);
      return 2;
    }
    if (c <= "@".charCodeAt(0)) {
      sb.append(1);
      sb.append(c - 58 + 15);
      return 2;
    }
    if (c >= "[".charCodeAt(0) && c <= "_".charCodeAt(0)) {
      sb.append(1);
      sb.append(c - 91 + 22);
      return 2;
    }
    if (c === "`".charCodeAt(0)) {
      sb.append(2);
      sb.append(0);
      return 2;
    }
    if (c <= "Z".charCodeAt(0)) {
      sb.append(2);
      sb.append(c - 65 + 1);
      return 2;
    }
    if (c <= 127) {
      sb.append(2);
      sb.append(c - 123 + 27);
      return 2;
    }
    sb.append(`${1}`);
    let len = 2;
    len += this.encodeChar(c - 128, sb);
    return len;
  }
}

export { TextEncoder };
//# sourceMappingURL=TextEncoder.js.map
//# sourceMappingURL=TextEncoder.js.map