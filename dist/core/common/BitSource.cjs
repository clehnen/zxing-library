'use strict';

var IllegalArgumentException = require('../IllegalArgumentException');

class BitSource {
  /*int*/
  /**
   * @param bytes bytes from which this will read bits. Bits will be read from the first byte first.
   * Bits are read within a byte from most-significant to least-significant bit.
   */
  constructor(bytes) {
    this.bytes = bytes;
    this.byteOffset = 0;
    this.bitOffset = 0;
  }
  bytes;
  byteOffset;
  /*int*/
  bitOffset;
  /**
   * @return index of next bit in current byte which would be read by the next call to {@link #readBits(int)}.
   */
  getBitOffset() {
    return this.bitOffset;
  }
  /**
   * @return index of next byte in input byte array which would be read by the next call to {@link #readBits(int)}.
   */
  getByteOffset() {
    return this.byteOffset;
  }
  /**
   * @param numBits number of bits to read
   * @return int representing the bits read. The bits will appear as the least-significant
   *         bits of the int
   * @throws IllegalArgumentException if numBits isn't in [1,32] or more than is available
   */
  readBits(numBits) {
    if (numBits < 1 || numBits > 32 || numBits > this.available()) {
      throw new IllegalArgumentException.IllegalArgumentException("" + numBits);
    }
    let result = 0;
    let bitOffset = this.bitOffset;
    let byteOffset = this.byteOffset;
    const bytes = this.bytes;
    if (bitOffset > 0) {
      const bitsLeft = 8 - bitOffset;
      const toRead = numBits < bitsLeft ? numBits : bitsLeft;
      const bitsToNotRead = bitsLeft - toRead;
      const mask = 255 >> 8 - toRead << bitsToNotRead;
      result = (bytes[byteOffset] & mask) >> bitsToNotRead;
      numBits -= toRead;
      bitOffset += toRead;
      if (bitOffset === 8) {
        bitOffset = 0;
        byteOffset++;
      }
    }
    if (numBits > 0) {
      while (numBits >= 8) {
        result = result << 8 | bytes[byteOffset] & 255;
        byteOffset++;
        numBits -= 8;
      }
      if (numBits > 0) {
        const bitsToNotRead = 8 - numBits;
        const mask = 255 >> bitsToNotRead << bitsToNotRead;
        result = result << numBits | (bytes[byteOffset] & mask) >> bitsToNotRead;
        bitOffset += numBits;
      }
    }
    this.bitOffset = bitOffset;
    this.byteOffset = byteOffset;
    return result;
  }
  /**
   * @return number of bits that can be read successfully
   */
  available() {
    return 8 * (this.bytes.length - this.byteOffset) - this.bitOffset;
  }
}

exports.BitSource = BitSource;
//# sourceMappingURL=BitSource.cjs.map
//# sourceMappingURL=BitSource.cjs.map