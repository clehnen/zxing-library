'use strict';

var Collections = require('../../util/Collections');
var State = require('./State');
var C = require('./EncoderConstants');
var CharMap = require('./CharMap');
var ShiftTable = require('./ShiftTable');
var StringUtils = require('../../common/StringUtils');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var C__namespace = /*#__PURE__*/_interopNamespace(C);
var CharMap__namespace = /*#__PURE__*/_interopNamespace(CharMap);
var ShiftTable__namespace = /*#__PURE__*/_interopNamespace(ShiftTable);

class AztecHighLevelEncoder {
  // A reverse mapping from [mode][char] to the encoding for that character
  // in that mode.  An entry of 0 indicates no mapping exists.
  // private static /*final*/ CHAR_MAP: Int32Array[] = static_CHAR_MAP(Arrays.createInt32Array(5, 256));
  // A map showing the available shift codes.  (The shifts to BINARY are not
  // shown
  // static /*final*/ SHIFT_TABLE: Int32Array[] = ShiftTable.static_SHIFT_TABLE(Arrays.createInt32Array(6, 6)); // mode shift codes, per table
  text;
  constructor(text) {
    this.text = text;
  }
  /**
   * @return text represented by this encoder encoded as a {@link BitArray}
   */
  encode() {
    const spaceCharCode = StringUtils.StringUtils.getCharCode(" ");
    const lineBreakCharCode = StringUtils.StringUtils.getCharCode("\n");
    let states = Collections.Collections.singletonList(State.State.INITIAL_STATE);
    for (let index = 0; index < this.text.length; index++) {
      let pairCode;
      let nextChar = index + 1 < this.text.length ? this.text[index + 1] : 0;
      switch (this.text[index]) {
        case StringUtils.StringUtils.getCharCode("\r"):
          pairCode = nextChar === lineBreakCharCode ? 2 : 0;
          break;
        case StringUtils.StringUtils.getCharCode("."):
          pairCode = nextChar === spaceCharCode ? 3 : 0;
          break;
        case StringUtils.StringUtils.getCharCode(","):
          pairCode = nextChar === spaceCharCode ? 4 : 0;
          break;
        case StringUtils.StringUtils.getCharCode(":"):
          pairCode = nextChar === spaceCharCode ? 5 : 0;
          break;
        default:
          pairCode = 0;
      }
      if (pairCode > 0) {
        states = AztecHighLevelEncoder.updateStateListForPair(
          states,
          index,
          pairCode
        );
        index++;
      } else {
        states = this.updateStateListForChar(states, index);
      }
    }
    const minState = Collections.Collections.min(states, (a, b) => {
      return a.getBitCount() - b.getBitCount();
    });
    return minState.toBitArray(this.text);
  }
  // We update a set of states for a new character by updating each state
  // for the new character, merging the results, and then removing the
  // non-optimal states.
  updateStateListForChar(states, index) {
    const result = [];
    for (let state of states) {
      this.updateStateForChar(state, index, result);
    }
    return AztecHighLevelEncoder.simplifyStates(result);
  }
  // Return a set of states that represent the possible ways of updating this
  // state for the next character.  The resulting set of states are added to
  // the "result" list.
  updateStateForChar(state, index, result) {
    let ch = this.text[index] & 255;
    let charInCurrentTable = CharMap__namespace.CHAR_MAP[state.getMode()][ch] > 0;
    let stateNoBinary = null;
    for (let mode = 0; mode <= C__namespace.MODE_PUNCT; mode++) {
      let charInMode = CharMap__namespace.CHAR_MAP[mode][ch];
      if (charInMode > 0) {
        if (stateNoBinary == null) {
          stateNoBinary = state.endBinaryShift(index);
        }
        if (!charInCurrentTable || mode === state.getMode() || mode === C__namespace.MODE_DIGIT) {
          const latchState = stateNoBinary.latchAndAppend(
            mode,
            charInMode
          );
          result.push(latchState);
        }
        if (!charInCurrentTable && ShiftTable__namespace.SHIFT_TABLE[state.getMode()][mode] >= 0) {
          const shiftState = stateNoBinary.shiftAndAppend(
            mode,
            charInMode
          );
          result.push(shiftState);
        }
      }
    }
    if (state.getBinaryShiftByteCount() > 0 || CharMap__namespace.CHAR_MAP[state.getMode()][ch] === 0) {
      let binaryState = state.addBinaryShiftChar(index);
      result.push(binaryState);
    }
  }
  static updateStateListForPair(states, index, pairCode) {
    const result = [];
    for (let state of states) {
      this.updateStateForPair(state, index, pairCode, result);
    }
    return this.simplifyStates(result);
  }
  static updateStateForPair(state, index, pairCode, result) {
    let stateNoBinary = state.endBinaryShift(index);
    result.push(stateNoBinary.latchAndAppend(C__namespace.MODE_PUNCT, pairCode));
    if (state.getMode() !== C__namespace.MODE_PUNCT) {
      result.push(stateNoBinary.shiftAndAppend(C__namespace.MODE_PUNCT, pairCode));
    }
    if (pairCode === 3 || pairCode === 4) {
      let digitState = stateNoBinary.latchAndAppend(
        C__namespace.MODE_DIGIT,
        16 - pairCode
      ).latchAndAppend(C__namespace.MODE_DIGIT, 1);
      result.push(digitState);
    }
    if (state.getBinaryShiftByteCount() > 0) {
      let binaryState = state.addBinaryShiftChar(index).addBinaryShiftChar(index + 1);
      result.push(binaryState);
    }
  }
  static simplifyStates(states) {
    let result = [];
    for (const newState of states) {
      let add = true;
      for (const oldState of result) {
        if (oldState.isBetterThanOrEqualTo(newState)) {
          add = false;
          break;
        }
        if (newState.isBetterThanOrEqualTo(oldState)) {
          result = result.filter((x) => x !== oldState);
        }
      }
      if (add) {
        result.push(newState);
      }
    }
    return result;
  }
}

exports.AztecHighLevelEncoder = AztecHighLevelEncoder;
//# sourceMappingURL=AztecHighLevelEncoder.cjs.map
//# sourceMappingURL=AztecHighLevelEncoder.cjs.map