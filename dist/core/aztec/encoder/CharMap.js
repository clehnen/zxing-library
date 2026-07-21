import * as C from './EncoderConstants';
import { ZXingArrays } from '../../util/ZXingArrays';
import { StringUtils } from '../../common/StringUtils';

function static_CHAR_MAP(CHAR_MAP2) {
  const spaceCharCode = StringUtils.getCharCode(" ");
  const pointCharCode = StringUtils.getCharCode(".");
  const commaCharCode = StringUtils.getCharCode(",");
  CHAR_MAP2[C.MODE_UPPER][spaceCharCode] = 1;
  const zUpperCharCode = StringUtils.getCharCode("Z");
  const aUpperCharCode = StringUtils.getCharCode("A");
  for (let c = aUpperCharCode; c <= zUpperCharCode; c++) {
    CHAR_MAP2[C.MODE_UPPER][c] = c - aUpperCharCode + 2;
  }
  CHAR_MAP2[C.MODE_LOWER][spaceCharCode] = 1;
  const zLowerCharCode = StringUtils.getCharCode("z");
  const aLowerCharCode = StringUtils.getCharCode("a");
  for (let c = aLowerCharCode; c <= zLowerCharCode; c++) {
    CHAR_MAP2[C.MODE_LOWER][c] = c - aLowerCharCode + 2;
  }
  CHAR_MAP2[C.MODE_DIGIT][spaceCharCode] = 1;
  const nineCharCode = StringUtils.getCharCode("9");
  const zeroCharCode = StringUtils.getCharCode("0");
  for (let c = zeroCharCode; c <= nineCharCode; c++) {
    CHAR_MAP2[C.MODE_DIGIT][c] = c - zeroCharCode + 2;
  }
  CHAR_MAP2[C.MODE_DIGIT][commaCharCode] = 12;
  CHAR_MAP2[C.MODE_DIGIT][pointCharCode] = 13;
  const mixedTable = [
    "\0",
    " ",
    "",
    "",
    "",
    "",
    "",
    "",
    "\x07",
    "\b",
    "	",
    "\n",
    "\v",
    "\f",
    "\r",
    "\x1B",
    "",
    "",
    "",
    "",
    "@",
    "\\",
    "^",
    "_",
    "`",
    "|",
    "~",
    "\x7F"
  ];
  for (let i = 0; i < mixedTable.length; i++) {
    CHAR_MAP2[C.MODE_MIXED][StringUtils.getCharCode(mixedTable[i])] = i;
  }
  const punctTable = [
    "\0",
    "\r",
    "\0",
    "\0",
    "\0",
    "\0",
    "!",
    "'",
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
    "[",
    "]",
    "{",
    "}"
  ];
  for (let i = 0; i < punctTable.length; i++) {
    if (StringUtils.getCharCode(punctTable[i]) > 0) {
      CHAR_MAP2[C.MODE_PUNCT][StringUtils.getCharCode(punctTable[i])] = i;
    }
  }
  return CHAR_MAP2;
}
const CHAR_MAP = static_CHAR_MAP(ZXingArrays.createInt32Array(5, 256));

export { CHAR_MAP, static_CHAR_MAP };
//# sourceMappingURL=CharMap.js.map
//# sourceMappingURL=CharMap.js.map