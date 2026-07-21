import { SymbolShapeHint, MACRO_05_HEADER, MACRO_TRAILER, MACRO_06_HEADER } from './constants';
import { DataMatrixHighLevelEncoder } from './DataMatrixHighLevelEncoder';
import { MinimalECIInput } from '../../common/MinimalECIInput';
import { ZXingInteger } from '../../util/ZXingInteger';

const C40_SHIFT2_CHARS = [
  "!",
  '"',
  "#",
  "$",
  "%",
  "&",
  "'",
  "(",
  ")",
  "*",
  "+",
  ",",
  "-",
  ".",
  "/",
  ":",
  ";",
  "<",
  "=",
  ">",
  "?",
  "@",
  "[",
  "\\",
  "]",
  "^",
  "_"
];
class MinimalEncoder {
  static isExtendedASCII(ch, fnc1) {
    return ch !== fnc1 && ch >= 128 && ch <= 255;
  }
  static isInC40Shift1Set(ch) {
    return ch <= 31;
  }
  static isInC40Shift2Set(ch, fnc1) {
    for (const c40Shift2Char of C40_SHIFT2_CHARS) {
      if (c40Shift2Char.charCodeAt(0) === ch) {
        return true;
      }
    }
    return ch === fnc1;
  }
  static isInTextShift1Set(ch) {
    return this.isInC40Shift1Set(ch);
  }
  static isInTextShift2Set(ch, fnc1) {
    return this.isInC40Shift2Set(ch, fnc1);
  }
  /**
   * Performs message encoding of a DataMatrix message
   *
   * @param msg the message
   * @param priorityCharset The preferred {@link ZXingCharset}. When the value of the argument is null, the algorithm
   *   chooses charsets that leads to a minimal representation. Otherwise the algorithm will use the priority
   *   charset to encode any character in the input that can be encoded by it if the charset is among the
   *   supported charsets.
   * @param fnc1 denotes the character in the input that represents the FNC1 character or -1 if this is not a GS1
   *   bar code. If the value is not -1 then a FNC1 is also prepended.
   * @param shape requested shape.
   * @return the encoded message (the char values range from 0 to 255)
   */
  static encodeHighLevel(msg, priorityCharset = null, fnc1 = -1, shape = SymbolShapeHint.FORCE_NONE) {
    let macroId = 0;
    if (msg.startsWith(MACRO_05_HEADER) && msg.endsWith(MACRO_TRAILER)) {
      macroId = 5;
      msg = msg.substring(MACRO_05_HEADER.length, msg.length - 2);
    } else if (msg.startsWith(MACRO_06_HEADER) && msg.endsWith(MACRO_TRAILER)) {
      macroId = 6;
      msg = msg.substring(MACRO_06_HEADER.length, msg.length - 2);
    }
    return decodeURIComponent(
      escape(
        String.fromCharCode(
          ...this.encode(msg, priorityCharset, fnc1, shape, macroId)
        )
      )
    );
  }
  /**
   * Encodes input minimally and returns an array of the codewords
   *
   * @param input The string to encode
   * @param priorityCharset The preferred {@link ZXingCharset}. When the value of the argument is null, the algorithm
   *   chooses charsets that leads to a minimal representation. Otherwise the algorithm will use the priority
   *   charset to encode any character in the input that can be encoded by it if the charset is among the
   *   supported charsets.
   * @param fnc1 denotes the character in the input that represents the FNC1 character or -1 if this is not a GS1
   *   bar code. If the value is not -1 then a FNC1 is also prepended.
   * @param shape requested shape.
   * @param macroId Prepends the specified macro function in case that a value of 5 or 6 is specified.
   * @return An array of bytes representing the codewords of a minimal encoding.
   */
  static encode(input, priorityCharset, fnc1, shape, macroId) {
    return this.encodeMinimally(
      new Input(input, priorityCharset, fnc1, shape, macroId)
    ).getBytes();
  }
  static addEdge(edges, edge) {
    const vertexIndex = edge.fromPosition + edge.characterLength;
    if (edges[vertexIndex][edge.getEndMode()] === null || edges[vertexIndex][edge.getEndMode()].cachedTotalSize > edge.cachedTotalSize) {
      edges[vertexIndex][edge.getEndMode()] = edge;
    }
  }
  /** @return the number of words in which the string starting at from can be encoded in c40 or text mode.
   *  The number of characters encoded is returned in characterLength.
   *  The number of characters encoded is also minimal in the sense that the algorithm stops as soon
   *  as a character encoding fills a C40 word competely (three C40 values). An exception is at the
   *  end of the string where two C40 values are allowed (according to the spec the third c40 value
   *  is filled  with 0 (Shift 1) in this case).
   */
  static getNumberOfC40Words(input, from, c40, characterLength) {
    let thirdsCount = 0;
    for (let i = from; i < input.length(); i++) {
      if (input.isECI(i)) {
        characterLength[0] = 0;
        return 0;
      }
      const ci = input.charAt(i);
      if (c40 && DataMatrixHighLevelEncoder.isNativeC40(ci) || !c40 && DataMatrixHighLevelEncoder.isNativeText(ci)) {
        thirdsCount++;
      } else if (!MinimalEncoder.isExtendedASCII(ci, input.getFNC1Character())) {
        thirdsCount += 2;
      } else {
        const asciiValue = ci & 255;
        if (asciiValue >= 128 && (c40 && DataMatrixHighLevelEncoder.isNativeC40(asciiValue - 128) || !c40 && DataMatrixHighLevelEncoder.isNativeText(asciiValue - 128))) {
          thirdsCount += 3;
        } else {
          thirdsCount += 4;
        }
      }
      if (thirdsCount % 3 === 0 || (thirdsCount - 2) % 3 === 0 && i + 1 === input.length()) {
        characterLength[0] = i - from + 1;
        return Math.ceil(thirdsCount / 3);
      }
    }
    characterLength[0] = 0;
    return 0;
  }
  static addEdges(input, edges, from, previous) {
    if (input.isECI(from)) {
      this.addEdge(edges, new Edge(input, 0 /* ASCII */, from, 1, previous));
      return;
    }
    const ch = input.charAt(from);
    if (previous === null || previous.getEndMode() !== 4 /* EDF */) {
      if (DataMatrixHighLevelEncoder.isDigit(ch) && input.haveNCharacters(from, 2) && DataMatrixHighLevelEncoder.isDigit(input.charAt(from + 1))) {
        this.addEdge(edges, new Edge(input, 0 /* ASCII */, from, 2, previous));
      } else {
        this.addEdge(edges, new Edge(input, 0 /* ASCII */, from, 1, previous));
      }
      const modes = [1 /* C40 */, 2 /* TEXT */];
      for (const mode of modes) {
        const characterLength = [];
        if (MinimalEncoder.getNumberOfC40Words(
          input,
          from,
          mode === 1 /* C40 */,
          characterLength
        ) > 0) {
          this.addEdge(
            edges,
            new Edge(input, mode, from, characterLength[0], previous)
          );
        }
      }
      if (input.haveNCharacters(from, 3) && DataMatrixHighLevelEncoder.isNativeX12(input.charAt(from)) && DataMatrixHighLevelEncoder.isNativeX12(input.charAt(from + 1)) && DataMatrixHighLevelEncoder.isNativeX12(input.charAt(from + 2))) {
        this.addEdge(edges, new Edge(input, 3 /* X12 */, from, 3, previous));
      }
      this.addEdge(edges, new Edge(input, 5 /* B256 */, from, 1, previous));
    }
    let i;
    for (i = 0; i < 3; i++) {
      const pos = from + i;
      if (input.haveNCharacters(pos, 1) && DataMatrixHighLevelEncoder.isNativeEDIFACT(input.charAt(pos))) {
        this.addEdge(edges, new Edge(input, 4 /* EDF */, from, i + 1, previous));
      } else {
        break;
      }
    }
    if (i === 3 && input.haveNCharacters(from, 4) && DataMatrixHighLevelEncoder.isNativeEDIFACT(input.charAt(from + 3))) {
      this.addEdge(edges, new Edge(input, 4 /* EDF */, from, 4, previous));
    }
  }
  static encodeMinimally(input) {
    const inputLength = input.length();
    const edges = Array(inputLength + 1).fill(null).map(() => Array(6).fill(0));
    this.addEdges(input, edges, 0, null);
    for (let i = 1; i <= inputLength; i++) {
      for (let j = 0; j < 6; j++) {
        if (edges[i][j] !== null && i < inputLength) {
          this.addEdges(input, edges, i, edges[i][j]);
        }
      }
      for (let j = 0; j < 6; j++) {
        edges[i - 1][j] = null;
      }
    }
    let minimalJ = -1;
    let minimalSize = ZXingInteger.MAX_VALUE;
    for (let j = 0; j < 6; j++) {
      if (edges[inputLength][j] !== null) {
        const edge = edges[inputLength][j];
        const size = j >= 1 && j <= 3 ? edge.cachedTotalSize + 1 : edge.cachedTotalSize;
        if (size < minimalSize) {
          minimalSize = size;
          minimalJ = j;
        }
      }
    }
    if (minimalJ < 0) {
      throw new Error('Failed to encode "' + input + '"');
    }
    return new Result(edges[inputLength][minimalJ]);
  }
}
class Result {
  bytes;
  constructor(solution) {
    const input = solution.input;
    let size = 0;
    let bytesAL = [];
    const randomizePostfixLength = [];
    const randomizeLengths = [];
    if ((solution.mode === 1 /* C40 */ || solution.mode === 2 /* TEXT */ || solution.mode === 3 /* X12 */) && solution.getEndMode() !== 0 /* ASCII */) {
      size += this.prepend(Edge.getBytes(254), bytesAL);
    }
    let current = solution;
    while (current !== null) {
      size += this.prepend(current.getDataBytes(), bytesAL);
      if (current.previous === null || current.getPreviousStartMode() !== current.getMode()) {
        if (current.getMode() === 5 /* B256 */) {
          if (size <= 249) {
            bytesAL.unshift(size);
            size++;
          } else {
            bytesAL.unshift(size % 250);
            bytesAL.unshift(size / 250 + 249);
            size += 2;
          }
          randomizePostfixLength.push(bytesAL.length);
          randomizeLengths.push(size);
        }
        this.prepend(current.getLatchBytes(), bytesAL);
        size = 0;
      }
      current = current.previous;
    }
    if (input.getMacroId() === 5) {
      size += this.prepend(Edge.getBytes(236), bytesAL);
    } else if (input.getMacroId() === 6) {
      size += this.prepend(Edge.getBytes(237), bytesAL);
    }
    if (input.getFNC1Character() > 0) {
      size += this.prepend(Edge.getBytes(232), bytesAL);
    }
    for (let i = 0; i < randomizePostfixLength.length; i++) {
      this.applyRandomPattern(
        bytesAL,
        bytesAL.length - randomizePostfixLength[i],
        randomizeLengths[i]
      );
    }
    const capacity = solution.getMinSymbolSize(bytesAL.length);
    if (bytesAL.length < capacity) {
      bytesAL.push(129);
    }
    while (bytesAL.length < capacity) {
      bytesAL.push(this.randomize253State(bytesAL.length + 1));
    }
    this.bytes = new Uint8Array(bytesAL.length);
    for (let i = 0; i < this.bytes.length; i++) {
      this.bytes[i] = bytesAL[i];
    }
  }
  prepend(bytes, into) {
    for (let i = bytes.length - 1; i >= 0; i--) {
      into.unshift(bytes[i]);
    }
    return bytes.length;
  }
  randomize253State(codewordPosition) {
    const pseudoRandom = 149 * codewordPosition % 253 + 1;
    const tempVariable = 129 + pseudoRandom;
    return tempVariable <= 254 ? tempVariable : tempVariable - 254;
  }
  applyRandomPattern(bytesAL, startPosition, length) {
    for (let i = 0; i < length; i++) {
      const Pad_codeword_position = startPosition + i;
      const Pad_codeword_value = bytesAL[Pad_codeword_position] & 255;
      const pseudo_random_number = 149 * (Pad_codeword_position + 1) % 255 + 1;
      const temp_variable = Pad_codeword_value + pseudo_random_number;
      bytesAL[Pad_codeword_position] = temp_variable <= 255 ? temp_variable : temp_variable - 256;
    }
  }
  getBytes() {
    return this.bytes;
  }
}
class Edge {
  constructor(input, mode, fromPosition, characterLength, previous) {
    this.input = input;
    this.mode = mode;
    this.fromPosition = fromPosition;
    this.characterLength = characterLength;
    this.previous = previous;
    if (!(fromPosition + characterLength <= input.length())) {
      throw new Error("Invalid edge");
    }
    let size = previous !== null ? previous.cachedTotalSize : 0;
    const previousMode = this.getPreviousMode();
    switch (mode) {
      case 0 /* ASCII */:
        size++;
        if (input.isECI(fromPosition) || MinimalEncoder.isExtendedASCII(
          input.charAt(fromPosition),
          input.getFNC1Character()
        )) {
          size++;
        }
        if (previousMode === 1 /* C40 */ || previousMode === 2 /* TEXT */ || previousMode === 3 /* X12 */) {
          size++;
        }
        break;
      case 5 /* B256 */:
        size++;
        if (previousMode !== 5 /* B256 */) {
          size++;
        } else if (this.getB256Size() === 250) {
          size++;
        }
        if (previousMode === 0 /* ASCII */) {
          size++;
        } else if (previousMode === 1 /* C40 */ || previousMode === 2 /* TEXT */ || previousMode === 3 /* X12 */) {
          size += 2;
        }
        break;
      case 1 /* C40 */:
      case 2 /* TEXT */:
      case 3 /* X12 */:
        if (mode === 3 /* X12 */) {
          size += 2;
        } else {
          let charLen = [];
          size += MinimalEncoder.getNumberOfC40Words(
            input,
            fromPosition,
            mode === 1 /* C40 */,
            charLen
          ) * 2;
        }
        if (previousMode === 0 /* ASCII */ || previousMode === 5 /* B256 */) {
          size++;
        } else if (previousMode !== mode && (previousMode === 1 /* C40 */ || previousMode === 2 /* TEXT */ || previousMode === 3 /* X12 */)) {
          size += 2;
        }
        break;
      case 4 /* EDF */:
        size += 3;
        if (previousMode === 0 /* ASCII */ || previousMode === 5 /* B256 */) {
          size++;
        } else if (previousMode === 1 /* C40 */ || previousMode === 2 /* TEXT */ || previousMode === 3 /* X12 */) {
          size += 2;
        }
        break;
    }
    this.cachedTotalSize = size;
  }
  input;
  mode;
  fromPosition;
  characterLength;
  previous;
  allCodewordCapacities = [
    3,
    5,
    8,
    10,
    12,
    16,
    18,
    22,
    30,
    32,
    36,
    44,
    49,
    62,
    86,
    114,
    144,
    174,
    204,
    280,
    368,
    456,
    576,
    696,
    816,
    1050,
    1304,
    1558
  ];
  squareCodewordCapacities = [
    3,
    5,
    8,
    12,
    18,
    22,
    30,
    36,
    44,
    62,
    86,
    114,
    144,
    174,
    204,
    280,
    368,
    456,
    576,
    696,
    816,
    1050,
    1304,
    1558
  ];
  rectangularCodewordCapacities = [5, 10, 16, 33, 32, 49];
  cachedTotalSize;
  // does not count beyond 250
  getB256Size() {
    let cnt = 0;
    let current = this;
    while (current !== null && current.mode === 5 /* B256 */ && cnt <= 250) {
      cnt++;
      current = current.previous;
    }
    return cnt;
  }
  getPreviousStartMode() {
    return this.previous === null ? 0 /* ASCII */ : this.previous.mode;
  }
  getPreviousMode() {
    return this.previous === null ? 0 /* ASCII */ : this.previous.getEndMode();
  }
  /** Returns Mode.ASCII in case that:
   *  - Mode is EDIFACT and characterLength is less than 4 or the remaining characters can be encoded in at most 2
   *    ASCII bytes.
   *  - Mode is C40, TEXT or X12 and the remaining characters can be encoded in at most 1 ASCII byte.
   *  Returns mode in all other cases.
   * */
  getEndMode() {
    if (this.mode === 4 /* EDF */) {
      if (this.characterLength < 4) {
        return 0 /* ASCII */;
      }
      const lastASCII = this.getLastASCII();
      if (lastASCII > 0 && this.getCodewordsRemaining(this.cachedTotalSize + lastASCII) <= 2 - lastASCII) {
        return 0 /* ASCII */;
      }
    }
    if (this.mode === 1 /* C40 */ || this.mode === 2 /* TEXT */ || this.mode === 3 /* X12 */) {
      if (this.fromPosition + this.characterLength >= this.input.length() && this.getCodewordsRemaining(this.cachedTotalSize) === 0) {
        return 0 /* ASCII */;
      }
      const lastASCII = this.getLastASCII();
      if (lastASCII === 1 && this.getCodewordsRemaining(this.cachedTotalSize + 1) === 0) {
        return 0 /* ASCII */;
      }
    }
    return this.mode;
  }
  getMode() {
    return this.mode;
  }
  /** Peeks ahead and returns 1 if the postfix consists of exactly two digits, 2 if the postfix consists of exactly
   *  two consecutive digits and a non extended character or of 4 digits.
   *  Returns 0 in any other case
   **/
  getLastASCII() {
    const length = this.input.length();
    const from = this.fromPosition + this.characterLength;
    if (length - from > 4 || from >= length) {
      return 0;
    }
    if (length - from === 1) {
      if (MinimalEncoder.isExtendedASCII(
        this.input.charAt(from),
        this.input.getFNC1Character()
      )) {
        return 0;
      }
      return 1;
    }
    if (length - from === 2) {
      if (MinimalEncoder.isExtendedASCII(
        this.input.charAt(from),
        this.input.getFNC1Character()
      ) || MinimalEncoder.isExtendedASCII(
        this.input.charAt(from + 1),
        this.input.getFNC1Character()
      )) {
        return 0;
      }
      if (DataMatrixHighLevelEncoder.isDigit(this.input.charAt(from)) && DataMatrixHighLevelEncoder.isDigit(this.input.charAt(from + 1))) {
        return 1;
      }
      return 2;
    }
    if (length - from === 3) {
      if (DataMatrixHighLevelEncoder.isDigit(this.input.charAt(from)) && DataMatrixHighLevelEncoder.isDigit(this.input.charAt(from + 1)) && !MinimalEncoder.isExtendedASCII(
        this.input.charAt(from + 2),
        this.input.getFNC1Character()
      )) {
        return 2;
      }
      if (DataMatrixHighLevelEncoder.isDigit(this.input.charAt(from + 1)) && DataMatrixHighLevelEncoder.isDigit(this.input.charAt(from + 2)) && !MinimalEncoder.isExtendedASCII(
        this.input.charAt(from),
        this.input.getFNC1Character()
      )) {
        return 2;
      }
      return 0;
    }
    if (DataMatrixHighLevelEncoder.isDigit(this.input.charAt(from)) && DataMatrixHighLevelEncoder.isDigit(this.input.charAt(from + 1)) && DataMatrixHighLevelEncoder.isDigit(this.input.charAt(from + 2)) && DataMatrixHighLevelEncoder.isDigit(this.input.charAt(from + 3))) {
      return 2;
    }
    return 0;
  }
  /** Returns the capacity in codewords of the smallest symbol that has enough capacity to fit the given minimal
   * number of codewords.
   **/
  getMinSymbolSize(minimum) {
    switch (this.input.getShapeHint()) {
      case SymbolShapeHint.FORCE_SQUARE:
        for (const capacity of this.squareCodewordCapacities) {
          if (capacity >= minimum) {
            return capacity;
          }
        }
        break;
      case SymbolShapeHint.FORCE_RECTANGLE:
        for (const capacity of this.rectangularCodewordCapacities) {
          if (capacity >= minimum) {
            return capacity;
          }
        }
        break;
    }
    for (const capacity of this.allCodewordCapacities) {
      if (capacity >= minimum) {
        return capacity;
      }
    }
    return this.allCodewordCapacities[this.allCodewordCapacities.length - 1];
  }
  /** Returns the remaining capacity in codewords of the smallest symbol that has enough capacity to fit the given
   * minimal number of codewords.
   **/
  getCodewordsRemaining(minimum) {
    return this.getMinSymbolSize(minimum) - minimum;
  }
  static getBytes(c1, c2) {
    const result = new Uint8Array(c2 ? 2 : 1);
    result[0] = c1;
    if (c2) {
      result[1] = c2;
    }
    return result;
  }
  setC40Word(bytes, offset, c1, c2, c3) {
    const val16 = 1600 * (c1 & 255) + 40 * (c2 & 255) + (c3 & 255) + 1;
    bytes[offset] = val16 / 256;
    bytes[offset + 1] = val16 % 256;
  }
  getX12Value(c) {
    return c === 13 ? 0 : c === 42 ? 1 : c === 62 ? 2 : c === 32 ? 3 : c >= 48 && c <= 57 ? c - 44 : c >= 65 && c <= 90 ? c - 51 : c;
  }
  getX12Words() {
    if (!(this.characterLength % 3 === 0)) {
      throw new Error("X12 words must be a multiple of 3");
    }
    const result = new Uint8Array(this.characterLength / 3 * 2);
    for (let i = 0; i < result.length; i += 2) {
      this.setC40Word(
        result,
        i,
        this.getX12Value(this.input.charAt(this.fromPosition + i / 2 * 3)),
        this.getX12Value(
          this.input.charAt(this.fromPosition + i / 2 * 3 + 1)
        ),
        this.getX12Value(this.input.charAt(this.fromPosition + i / 2 * 3 + 2))
      );
    }
    return result;
  }
  getShiftValue(c, c40, fnc1) {
    return c40 && MinimalEncoder.isInC40Shift1Set(c) || !c40 && MinimalEncoder.isInTextShift1Set(c) ? 0 : c40 && MinimalEncoder.isInC40Shift2Set(c, fnc1) || !c40 && MinimalEncoder.isInTextShift2Set(c, fnc1) ? 1 : 2;
  }
  getC40Value(c40, setIndex, c, fnc1) {
    if (c === fnc1) {
      if (!(setIndex === 2)) {
        throw new Error("FNC1 cannot be used in C40 shift 2");
      }
      return 27;
    }
    if (c40) {
      return c <= 31 ? c : c === 32 ? 3 : c <= 47 ? c - 33 : c <= 57 ? c - 44 : c <= 64 ? c - 43 : c <= 90 ? c - 51 : c <= 95 ? c - 69 : c <= 127 ? c - 96 : c;
    } else {
      return c === 0 ? 0 : setIndex === 0 && c <= 3 ? c - 1 : setIndex === 1 && c <= 31 ? c : c === 32 ? 3 : c >= 33 && c <= 47 ? c - 33 : c >= 48 && c <= 57 ? c - 44 : c >= 58 && c <= 64 ? c - 43 : c >= 65 && c <= 90 ? c - 64 : c >= 91 && c <= 95 ? c - 69 : c === 96 ? 0 : c >= 97 && c <= 122 ? c - 83 : c >= 123 && c <= 127 ? c - 96 : c;
    }
  }
  getC40Words(c40, fnc1) {
    const c40Values = [];
    for (let i = 0; i < this.characterLength; i++) {
      const ci = this.input.charAt(this.fromPosition + i);
      if (c40 && DataMatrixHighLevelEncoder.isNativeC40(ci) || !c40 && DataMatrixHighLevelEncoder.isNativeText(ci)) {
        c40Values.push(this.getC40Value(c40, 0, ci, fnc1));
      } else if (!MinimalEncoder.isExtendedASCII(ci, fnc1)) {
        const shiftValue = this.getShiftValue(ci, c40, fnc1);
        c40Values.push(shiftValue);
        c40Values.push(this.getC40Value(c40, shiftValue, ci, fnc1));
      } else {
        const asciiValue = (ci & 255) - 128;
        if (c40 && DataMatrixHighLevelEncoder.isNativeC40(asciiValue) || !c40 && DataMatrixHighLevelEncoder.isNativeText(asciiValue)) {
          c40Values.push(1);
          c40Values.push(30);
          c40Values.push(this.getC40Value(c40, 0, asciiValue, fnc1));
        } else {
          c40Values.push(1);
          c40Values.push(30);
          const shiftValue = this.getShiftValue(asciiValue, c40, fnc1);
          c40Values.push(shiftValue);
          c40Values.push(this.getC40Value(c40, shiftValue, asciiValue, fnc1));
        }
      }
    }
    if (c40Values.length % 3 !== 0) {
      if (!((c40Values.length - 2) % 3 === 0 && this.fromPosition + this.characterLength === this.input.length())) {
        throw new Error("C40 words must be a multiple of 3");
      }
      c40Values.push(0);
    }
    const result = new Uint8Array(c40Values.length / 3 * 2);
    let byteIndex = 0;
    for (let i = 0; i < c40Values.length; i += 3) {
      this.setC40Word(
        result,
        byteIndex,
        c40Values[i] & 255,
        c40Values[i + 1] & 255,
        c40Values[i + 2] & 255
      );
      byteIndex += 2;
    }
    return result;
  }
  getEDFBytes() {
    const numberOfThirds = Math.ceil(this.characterLength / 4);
    const result = new Uint8Array(numberOfThirds * 3);
    let pos = this.fromPosition;
    const endPos = Math.min(
      this.fromPosition + this.characterLength - 1,
      this.input.length() - 1
    );
    for (let i = 0; i < numberOfThirds; i += 3) {
      const edfValues = [];
      for (let j = 0; j < 4; j++) {
        if (pos <= endPos) {
          edfValues[j] = this.input.charAt(pos++) & 63;
        } else {
          edfValues[j] = pos === endPos + 1 ? 31 : 0;
        }
      }
      let val24 = edfValues[0] << 18;
      val24 |= edfValues[1] << 12;
      val24 |= edfValues[2] << 6;
      val24 |= edfValues[3];
      result[i] = val24 >> 16 & 255;
      result[i + 1] = val24 >> 8 & 255;
      result[i + 2] = val24 & 255;
    }
    return result;
  }
  getLatchBytes() {
    switch (this.getPreviousMode()) {
      case 0 /* ASCII */:
      case 5 /* B256 */:
        switch (this.mode) {
          case 5 /* B256 */:
            return Edge.getBytes(231);
          case 1 /* C40 */:
            return Edge.getBytes(230);
          case 2 /* TEXT */:
            return Edge.getBytes(239);
          case 3 /* X12 */:
            return Edge.getBytes(238);
          case 4 /* EDF */:
            return Edge.getBytes(240);
        }
        break;
      case 1 /* C40 */:
      case 2 /* TEXT */:
      case 3 /* X12 */:
        if (this.mode !== this.getPreviousMode()) {
          switch (this.mode) {
            case 0 /* ASCII */:
              return Edge.getBytes(254);
            case 5 /* B256 */:
              return Edge.getBytes(254, 231);
            case 1 /* C40 */:
              return Edge.getBytes(254, 230);
            case 2 /* TEXT */:
              return Edge.getBytes(254, 239);
            case 3 /* X12 */:
              return Edge.getBytes(254, 238);
            case 4 /* EDF */:
              return Edge.getBytes(254, 240);
          }
        }
        break;
      case 4 /* EDF */:
        if (this.mode !== 4 /* EDF */) {
          throw new Error("Cannot switch from EDF to " + this.mode);
        }
        break;
    }
    return new Uint8Array(0);
  }
  // Important: The function does not return the length bytes (one or two) in case of B256 encoding
  getDataBytes() {
    switch (this.mode) {
      case 0 /* ASCII */:
        if (this.input.isECI(this.fromPosition)) {
          return Edge.getBytes(
            241,
            this.input.getECIValue(this.fromPosition) + 1
          );
        } else if (MinimalEncoder.isExtendedASCII(
          this.input.charAt(this.fromPosition),
          this.input.getFNC1Character()
        )) {
          return Edge.getBytes(235, this.input.charAt(this.fromPosition) - 127);
        } else if (this.characterLength === 2) {
          return Edge.getBytes(
            this.input.charAt(this.fromPosition) * 10 + this.input.charAt(this.fromPosition + 1) + 130
          );
        } else if (this.input.isFNC1(this.fromPosition)) {
          return Edge.getBytes(232);
        } else {
          return Edge.getBytes(this.input.charAt(this.fromPosition) + 1);
        }
      case 5 /* B256 */:
        return Edge.getBytes(this.input.charAt(this.fromPosition));
      case 1 /* C40 */:
        return this.getC40Words(true, this.input.getFNC1Character());
      case 2 /* TEXT */:
        return this.getC40Words(false, this.input.getFNC1Character());
      case 3 /* X12 */:
        return this.getX12Words();
      case 4 /* EDF */:
        return this.getEDFBytes();
    }
  }
}
class Input extends MinimalECIInput {
  constructor(stringToEncode, priorityCharset, fnc1, shape, macroId) {
    super(stringToEncode, priorityCharset, fnc1);
    this.shape = shape;
    this.macroId = macroId;
  }
  shape;
  macroId;
  getMacroId() {
    return this.macroId;
  }
  getShapeHint() {
    return this.shape;
  }
}

export { MinimalEncoder };
//# sourceMappingURL=MinimalEncoder.js.map
//# sourceMappingURL=MinimalEncoder.js.map