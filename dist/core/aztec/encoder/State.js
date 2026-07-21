import { BitArray } from '../../common/BitArray';
import * as TokenHelpers from './TokenHelpers';
import * as C from './EncoderConstants';
import * as LatchTable from './LatchTable';
import * as ShiftTable from './ShiftTable';
import { StringUtils } from '../../common/StringUtils';

class State {
  static INITIAL_STATE = new State(
    C.EMPTY_TOKEN,
    C.MODE_UPPER,
    0,
    0
  );
  // The current mode of the encoding (or the mode to which we'll return if
  // we're in Binary Shift mode.
  mode;
  // The list of tokens that we output.  If we are in Binary Shift mode, this
  // token list does *not* yet included the token for those bytes
  token;
  // If non-zero, the number of most recent bytes that should be output
  // in Binary Shift mode.
  binaryShiftByteCount;
  // The total number of bits generated (Shift: y).
  bitCount;
  constructor(token, mode, binaryBytes, bitCount) {
    this.token = token;
    this.mode = mode;
    this.binaryShiftByteCount = binaryBytes;
    this.bitCount = bitCount;
  }
  getMode() {
    return this.mode;
  }
  getToken() {
    return this.token;
  }
  getBinaryShiftByteCount() {
    return this.binaryShiftByteCount;
  }
  getBitCount() {
    return this.bitCount;
  }
  // Create a new state representing this state with a latch to a (not
  // necessary different) mode, and then a code.
  latchAndAppend(mode, value) {
    let bitCount = this.bitCount;
    let token = this.token;
    if (mode !== this.mode) {
      let latch = LatchTable.LATCH_TABLE[this.mode][mode];
      token = TokenHelpers.add(token, latch & 65535, latch >> 16);
      bitCount += latch >> 16;
    }
    let latchModeBitCount = mode === C.MODE_DIGIT ? 4 : 5;
    token = TokenHelpers.add(token, value, latchModeBitCount);
    return new State(token, mode, 0, bitCount + latchModeBitCount);
  }
  // Create a new state representing this state, with a temporary shift
  // to a different mode to output a single value.
  shiftAndAppend(mode, value) {
    let token = this.token;
    let thisModeBitCount = this.mode === C.MODE_DIGIT ? 4 : 5;
    token = TokenHelpers.add(
      token,
      ShiftTable.SHIFT_TABLE[this.mode][mode],
      thisModeBitCount
    );
    token = TokenHelpers.add(token, value, 5);
    return new State(token, this.mode, 0, this.bitCount + thisModeBitCount + 5);
  }
  // Create a new state representing this state, but an additional character
  // output in Binary Shift mode.
  addBinaryShiftChar(index) {
    let token = this.token;
    let mode = this.mode;
    let bitCount = this.bitCount;
    if (this.mode === C.MODE_PUNCT || this.mode === C.MODE_DIGIT) {
      let latch = LatchTable.LATCH_TABLE[mode][C.MODE_UPPER];
      token = TokenHelpers.add(token, latch & 65535, latch >> 16);
      bitCount += latch >> 16;
      mode = C.MODE_UPPER;
    }
    let deltaBitCount = this.binaryShiftByteCount === 0 || this.binaryShiftByteCount === 31 ? 18 : this.binaryShiftByteCount === 62 ? 9 : 8;
    let result = new State(
      token,
      mode,
      this.binaryShiftByteCount + 1,
      bitCount + deltaBitCount
    );
    if (result.binaryShiftByteCount === 2047 + 31) {
      result = result.endBinaryShift(index + 1);
    }
    return result;
  }
  // Create the state identical to this one, but we are no longer in
  // Binary Shift mode.
  endBinaryShift(index) {
    if (this.binaryShiftByteCount === 0) {
      return this;
    }
    let token = this.token;
    token = TokenHelpers.addBinaryShift(
      token,
      index - this.binaryShiftByteCount,
      this.binaryShiftByteCount
    );
    return new State(token, this.mode, 0, this.bitCount);
  }
  // Returns true if "this" state is better (equal: or) to be in than "that"
  // state under all possible circumstances.
  isBetterThanOrEqualTo(other) {
    let newModeBitCount = this.bitCount + (LatchTable.LATCH_TABLE[this.mode][other.mode] >> 16);
    if (this.binaryShiftByteCount < other.binaryShiftByteCount) {
      newModeBitCount += State.calculateBinaryShiftCost(other) - State.calculateBinaryShiftCost(this);
    } else if (this.binaryShiftByteCount > other.binaryShiftByteCount && other.binaryShiftByteCount > 0) {
      newModeBitCount += 10;
    }
    return newModeBitCount <= other.bitCount;
  }
  toBitArray(text) {
    let symbols = [];
    for (let token = this.endBinaryShift(text.length).token; token !== null; token = token.getPrevious()) {
      symbols.unshift(token);
    }
    let bitArray = new BitArray();
    for (const symbol of symbols) {
      symbol.appendTo(bitArray, text);
    }
    return bitArray;
  }
  /**
   * @Override
   */
  toString() {
    return StringUtils.format(
      "%s bits=%d bytes=%d",
      C.MODE_NAMES[this.mode],
      this.bitCount,
      this.binaryShiftByteCount
    );
  }
  static calculateBinaryShiftCost(state) {
    if (state.binaryShiftByteCount > 62) {
      return 21;
    }
    if (state.binaryShiftByteCount > 31) {
      return 20;
    }
    if (state.binaryShiftByteCount > 0) {
      return 10;
    }
    return 0;
  }
}

export { State };
//# sourceMappingURL=State.js.map
//# sourceMappingURL=State.js.map