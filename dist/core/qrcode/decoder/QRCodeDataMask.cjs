'use strict';

var DataMaskValues = /* @__PURE__ */ ((DataMaskValues2) => {
  DataMaskValues2[DataMaskValues2["DATA_MASK_000"] = 0] = "DATA_MASK_000";
  DataMaskValues2[DataMaskValues2["DATA_MASK_001"] = 1] = "DATA_MASK_001";
  DataMaskValues2[DataMaskValues2["DATA_MASK_010"] = 2] = "DATA_MASK_010";
  DataMaskValues2[DataMaskValues2["DATA_MASK_011"] = 3] = "DATA_MASK_011";
  DataMaskValues2[DataMaskValues2["DATA_MASK_100"] = 4] = "DATA_MASK_100";
  DataMaskValues2[DataMaskValues2["DATA_MASK_101"] = 5] = "DATA_MASK_101";
  DataMaskValues2[DataMaskValues2["DATA_MASK_110"] = 6] = "DATA_MASK_110";
  DataMaskValues2[DataMaskValues2["DATA_MASK_111"] = 7] = "DATA_MASK_111";
  return DataMaskValues2;
})(DataMaskValues || {});
class QRCodeDataMask {
  // See ISO 18004:2006 6.8.1
  constructor(value, isMasked) {
    this.value = value;
    this.isMasked = isMasked;
  }
  value;
  isMasked;
  static values = /* @__PURE__ */ new Map([
    /**
     * 000: mask bits for which (x + y) mod 2 == 0
     */
    [0 /* DATA_MASK_000 */, new QRCodeDataMask(0 /* DATA_MASK_000 */, (i, j) => {
      return (i + j & 1) === 0;
    })],
    /**
     * 001: mask bits for which x mod 2 == 0
     */
    [1 /* DATA_MASK_001 */, new QRCodeDataMask(1 /* DATA_MASK_001 */, (i, j) => {
      return (i & 1) === 0;
    })],
    /**
     * 010: mask bits for which y mod 3 == 0
     */
    [2 /* DATA_MASK_010 */, new QRCodeDataMask(2 /* DATA_MASK_010 */, (i, j) => {
      return j % 3 === 0;
    })],
    /**
     * 011: mask bits for which (x + y) mod 3 == 0
     */
    [3 /* DATA_MASK_011 */, new QRCodeDataMask(3 /* DATA_MASK_011 */, (i, j) => {
      return (i + j) % 3 === 0;
    })],
    /**
     * 100: mask bits for which (x/2 + y/3) mod 2 == 0
     */
    [4 /* DATA_MASK_100 */, new QRCodeDataMask(4 /* DATA_MASK_100 */, (i, j) => {
      return (Math.floor(i / 2) + Math.floor(j / 3) & 1) === 0;
    })],
    /**
     * 101: mask bits for which xy mod 2 + xy mod 3 == 0
     * equivalently, such that xy mod 6 == 0
     */
    [5 /* DATA_MASK_101 */, new QRCodeDataMask(5 /* DATA_MASK_101 */, (i, j) => {
      return i * j % 6 === 0;
    })],
    /**
     * 110: mask bits for which (xy mod 2 + xy mod 3) mod 2 == 0
     * equivalently, such that xy mod 6 < 3
     */
    [6 /* DATA_MASK_110 */, new QRCodeDataMask(6 /* DATA_MASK_110 */, (i, j) => {
      return i * j % 6 < 3;
    })],
    /**
     * 111: mask bits for which ((x+y)mod 2 + xy mod 3) mod 2 == 0
     * equivalently, such that (x + y + xy mod 3) mod 2 == 0
     */
    [7 /* DATA_MASK_111 */, new QRCodeDataMask(7 /* DATA_MASK_111 */, (i, j) => {
      return (i + j + i * j % 3 & 1) === 0;
    })]
  ]);
  // End of enum constants.
  /**
   * <p>Implementations of this method reverse the data masking process applied to a QR Code and
   * make its bits ready to read.</p>
   *
   * @param bits representation of QR Code bits
   * @param dimension dimension of QR Code, represented by bits, being unmasked
   */
  unmaskBitMatrix(bits, dimension) {
    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        if (this.isMasked(i, j)) {
          bits.flip(j, i);
        }
      }
    }
  }
  // abstract boolean isMasked(i: number /*int*/, j: number /*int*/);
}

exports.DataMaskValues = DataMaskValues;
exports.QRCodeDataMask = QRCodeDataMask;
//# sourceMappingURL=QRCodeDataMask.cjs.map
//# sourceMappingURL=QRCodeDataMask.cjs.map