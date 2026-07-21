import { IllegalArgumentException } from '../IllegalArgumentException';
import { ZXingArrays } from '../util/ZXingArrays';
import { ZXingInteger } from '../util/ZXingInteger';
import { ZXingSystem } from '../util/ZXingSystem';

class BitArray {
  size;
  bits;
  // public constructor() {
  //   this.size = 0
  //   this.bits = new Int32Array(1)
  // }
  // public constructor(size?: number /*int*/) {
  //   if (undefined === size) {
  //     this.size = 0
  //   } else {
  //     this.size = size
  //   }
  //   this.bits = this.makeArray(size)
  // }
  // For testing only
  constructor(size, bits) {
    if (void 0 === size) {
      this.size = 0;
      this.bits = new Int32Array(1);
    } else {
      this.size = size;
      if (void 0 === bits || null === bits) {
        this.bits = BitArray.makeArray(size);
      } else {
        this.bits = bits;
      }
    }
  }
  getSize() {
    return this.size;
  }
  getSizeInBytes() {
    return Math.floor((this.size + 7) / 8);
  }
  ensureCapacity(size) {
    if (size > this.bits.length * 32) {
      const newBits = BitArray.makeArray(size);
      ZXingSystem.arraycopy(this.bits, 0, newBits, 0, this.bits.length);
      this.bits = newBits;
    }
  }
  /**
   * @param i bit to get
   * @return true iff bit i is set
   */
  get(i) {
    return (this.bits[Math.floor(i / 32)] & 1 << (i & 31)) !== 0;
  }
  /**
   * Sets bit i.
   *
   * @param i bit to set
   */
  set(i) {
    this.bits[Math.floor(i / 32)] |= 1 << (i & 31);
  }
  /**
   * Flips bit i.
   *
   * @param i bit to set
   */
  flip(i) {
    this.bits[Math.floor(i / 32)] ^= 1 << (i & 31);
  }
  /**
   * @param from first bit to check
   * @return index of first bit that is set, starting from the given index, or size if none are set
   *  at or beyond this given index
   * @see #getNextUnset(int)
   */
  getNextSet(from) {
    const size = this.size;
    if (from >= size) {
      return size;
    }
    const bits = this.bits;
    let bitsOffset = Math.floor(from / 32);
    let currentBits = bits[bitsOffset];
    currentBits &= ~((1 << (from & 31)) - 1);
    const length = bits.length;
    while (currentBits === 0) {
      if (++bitsOffset === length) {
        return size;
      }
      currentBits = bits[bitsOffset];
    }
    const result = bitsOffset * 32 + ZXingInteger.numberOfTrailingZeros(currentBits);
    return result > size ? size : result;
  }
  /**
   * @param from index to start looking for unset bit
   * @return index of next unset bit, or {@code size} if none are unset until the end
   * @see #getNextSet(int)
   */
  getNextUnset(from) {
    const size = this.size;
    if (from >= size) {
      return size;
    }
    const bits = this.bits;
    let bitsOffset = Math.floor(from / 32);
    let currentBits = ~bits[bitsOffset];
    currentBits &= ~((1 << (from & 31)) - 1);
    const length = bits.length;
    while (currentBits === 0) {
      if (++bitsOffset === length) {
        return size;
      }
      currentBits = ~bits[bitsOffset];
    }
    const result = bitsOffset * 32 + ZXingInteger.numberOfTrailingZeros(currentBits);
    return result > size ? size : result;
  }
  /**
   * Sets a block of 32 bits, starting at bit i.
   *
   * @param i first bit to set
   * @param newBits the new value of the next 32 bits. Note again that the least-significant bit
   * corresponds to bit i, the next-least-significant to i+1, and so on.
   */
  setBulk(i, newBits) {
    this.bits[Math.floor(i / 32)] = newBits;
  }
  /**
   * Sets a range of bits.
   *
   * @param start start of range, inclusive.
   * @param end end of range, exclusive
   */
  setRange(start, end) {
    if (end < start || start < 0 || end > this.size) {
      throw new IllegalArgumentException();
    }
    if (end === start) {
      return;
    }
    end--;
    const firstInt = Math.floor(start / 32);
    const lastInt = Math.floor(end / 32);
    const bits = this.bits;
    for (let i = firstInt; i <= lastInt; i++) {
      const firstBit = i > firstInt ? 0 : start & 31;
      const lastBit = i < lastInt ? 31 : end & 31;
      const mask = (2 << lastBit) - (1 << firstBit);
      bits[i] |= mask;
    }
  }
  /**
   * Clears all bits (sets to false).
   */
  clear() {
    const max = this.bits.length;
    const bits = this.bits;
    for (let i = 0; i < max; i++) {
      bits[i] = 0;
    }
  }
  /**
   * Efficient method to check if a range of bits is set, or not set.
   *
   * @param start start of range, inclusive.
   * @param end end of range, exclusive
   * @param value if true, checks that bits in range are set, otherwise checks that they are not set
   * @return true iff all bits are set or not set in range, according to value argument
   * @throws IllegalArgumentException if end is less than start or the range is not contained in the array
   */
  isRange(start, end, value) {
    if (end < start || start < 0 || end > this.size) {
      throw new IllegalArgumentException();
    }
    if (end === start) {
      return true;
    }
    end--;
    const firstInt = Math.floor(start / 32);
    const lastInt = Math.floor(end / 32);
    const bits = this.bits;
    for (let i = firstInt; i <= lastInt; i++) {
      const firstBit = i > firstInt ? 0 : start & 31;
      const lastBit = i < lastInt ? 31 : end & 31;
      const mask = (2 << lastBit) - (1 << firstBit) & 4294967295;
      if ((bits[i] & mask) !== (value ? mask : 0)) {
        return false;
      }
    }
    return true;
  }
  appendBit(bit) {
    this.ensureCapacity(this.size + 1);
    if (bit) {
      this.bits[Math.floor(this.size / 32)] |= 1 << (this.size & 31);
    }
    this.size++;
  }
  /**
   * Appends the least-significant bits, from value, in order from most-significant to
   * least-significant. For example, appending 6 bits from 0x000001E will append the bits
   * 0, 1, 1, 1, 1, 0 in that order.
   *
   * @param value {@code int} containing bits to append
   * @param numBits bits from value to append
   */
  appendBits(value, numBits) {
    if (numBits < 0 || numBits > 32) {
      throw new IllegalArgumentException("Num bits must be between 0 and 32");
    }
    this.ensureCapacity(this.size + numBits);
    for (let numBitsLeft = numBits; numBitsLeft > 0; numBitsLeft--) {
      this.appendBit((value >> numBitsLeft - 1 & 1) === 1);
    }
  }
  appendBitArray(other) {
    const otherSize = other.size;
    this.ensureCapacity(this.size + otherSize);
    for (let i = 0; i < otherSize; i++) {
      this.appendBit(other.get(i));
    }
  }
  xor(other) {
    if (this.size !== other.size) {
      throw new IllegalArgumentException("Sizes don't match");
    }
    const bits = this.bits;
    for (let i = 0, length = bits.length; i < length; i++) {
      bits[i] ^= other.bits[i];
    }
  }
  /**
   *
   * @param bitOffset first bit to start writing
   * @param array array to write into. Bytes are written most-significant byte first. This is the opposite
   *  of the internal representation, which is exposed by {@link #getBitArray()}
   * @param offset position in array to start writing
   * @param numBytes how many bytes to write
   */
  toBytes(bitOffset, array, offset, numBytes) {
    for (let i = 0; i < numBytes; i++) {
      let theByte = 0;
      for (let j = 0; j < 8; j++) {
        if (this.get(bitOffset)) {
          theByte |= 1 << 7 - j;
        }
        bitOffset++;
      }
      array[offset + i] = /*(byte)*/
      theByte;
    }
  }
  /**
   * @return underlying array of ints. The first element holds the first 32 bits, and the least
   *         significant bit is bit 0.
   */
  getBitArray() {
    return this.bits;
  }
  /**
   * Reverses all bits in the array.
   */
  reverse() {
    const newBits = new Int32Array(this.bits.length);
    const len = Math.floor((this.size - 1) / 32);
    const oldBitsLen = len + 1;
    const bits = this.bits;
    for (let i = 0; i < oldBitsLen; i++) {
      let x = bits[i];
      x = x >> 1 & 1431655765 | (x & 1431655765) << 1;
      x = x >> 2 & 858993459 | (x & 858993459) << 2;
      x = x >> 4 & 252645135 | (x & 252645135) << 4;
      x = x >> 8 & 16711935 | (x & 16711935) << 8;
      x = x >> 16 & 65535 | (x & 65535) << 16;
      newBits[len - i] = /*(int)*/
      x;
    }
    if (this.size !== oldBitsLen * 32) {
      const leftOffset = oldBitsLen * 32 - this.size;
      let currentInt = newBits[0] >>> leftOffset;
      for (let i = 1; i < oldBitsLen; i++) {
        const nextInt = newBits[i];
        currentInt |= nextInt << 32 - leftOffset;
        newBits[i - 1] = currentInt;
        currentInt = nextInt >>> leftOffset;
      }
      newBits[oldBitsLen - 1] = currentInt;
    }
    this.bits = newBits;
  }
  static makeArray(size) {
    return new Int32Array(Math.floor((size + 31) / 32));
  }
  /*@Override*/
  equals(o) {
    if (!(o instanceof BitArray)) {
      return false;
    }
    const other = o;
    return this.size === other.size && ZXingArrays.equals(this.bits, other.bits);
  }
  /*@Override*/
  hashCode() {
    return 31 * this.size + ZXingArrays.hashCode(this.bits);
  }
  /*@Override*/
  toString() {
    let result = "";
    for (let i = 0, size = this.size; i < size; i++) {
      if ((i & 7) === 0) {
        result += " ";
      }
      result += this.get(i) ? "X" : ".";
    }
    return result;
  }
  /*@Override*/
  clone() {
    return new BitArray(this.size, this.bits.slice());
  }
  /**
   * converts to boolean array.
   */
  toArray() {
    let result = [];
    for (let i = 0, size = this.size; i < size; i++) {
      result.push(this.get(i));
    }
    return result;
  }
}

export { BitArray };
//# sourceMappingURL=BitArray.js.map
//# sourceMappingURL=BitArray.js.map