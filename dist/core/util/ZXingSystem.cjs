'use strict';

class ZXingSystem {
  // public static void arraycopy(Object src, int srcPos, Object dest, int destPos, int length)
  /**
   * Makes a copy of a array.
   */
  static arraycopy(src, srcPos, dest, destPos, length) {
    if (src === dest && srcPos < destPos) {
      destPos += length - 1;
      srcPos += length - 1;
      while (length--) {
        dest[destPos--] = src[srcPos--];
      }
    } else {
      while (length--) {
        dest[destPos++] = src[srcPos++];
      }
    }
  }
  /**
   * Returns the current time in milliseconds.
   */
  static currentTimeMillis() {
    return Date.now();
  }
}

exports.ZXingSystem = ZXingSystem;
//# sourceMappingURL=ZXingSystem.cjs.map
//# sourceMappingURL=ZXingSystem.cjs.map