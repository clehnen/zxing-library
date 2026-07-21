'use strict';

class MicroQRDataMask {
  constructor(maskIndex, isMasked) {
    this.maskIndex = maskIndex;
    this.isMasked = isMasked;
  }
  maskIndex;
  isMasked;
  static MASKS = [
    // 00: i mod 2 = 0
    new MicroQRDataMask(0, (i, _j) => (i & 1) === 0),
    // 01: ((i div 2) + (j div 3)) mod 2 = 0
    new MicroQRDataMask(1, (i, j) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0),
    // 10: ((i*j mod 2) + (i*j mod 3)) mod 2 = 0
    new MicroQRDataMask(2, (i, j) => {
      const tmp = i * j;
      return ((tmp & 1) + tmp % 3) % 2 === 0;
    }),
    // 11: ((i+j) mod 2 + i*j mod 3) mod 2 = 0
    new MicroQRDataMask(3, (i, j) => ((i + j & 1) + i * j % 3) % 2 === 0)
  ];
  static forIndex(maskIndex) {
    if (maskIndex < 0 || maskIndex >= MicroQRDataMask.MASKS.length) {
      throw new Error("Invalid Micro QR mask index: " + maskIndex);
    }
    return MicroQRDataMask.MASKS[maskIndex];
  }
  /**
   * Un-mask a BitMatrix (XOR mask bits).
   * Applies to the entire matrix; function modules will be ignored by the parser.
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
}

exports.MicroQRDataMask = MicroQRDataMask;
//# sourceMappingURL=MicroQRDataMask.cjs.map
//# sourceMappingURL=MicroQRDataMask.cjs.map