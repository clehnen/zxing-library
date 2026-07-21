'use strict';

class Long {
  /**
   * Parses a string to a number, since JS has no really Int64.
   *
   * @param num Numeric string.
   * @param radix Destination radix.
   */
  static parseLong(num, radix = void 0) {
    return parseInt(num, radix);
  }
}

exports.Long = Long;
//# sourceMappingURL=Long.cjs.map
//# sourceMappingURL=Long.cjs.map