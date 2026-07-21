'use strict';

var C = require('./EncoderConstants');
var ZXingArrays = require('../../util/ZXingArrays');
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

function static_CHAR_MAP(CHAR_MAP2) {
  const spaceCharCode = StringUtils.StringUtils.getCharCode(" ");
  const pointCharCode = StringUtils.StringUtils.getCharCode(".");
  const commaCharCode = StringUtils.StringUtils.getCharCode(",");
  CHAR_MAP2[C__namespace.MODE_UPPER][spaceCharCode] = 1;
  const zUpperCharCode = StringUtils.StringUtils.getCharCode("Z");
  const aUpperCharCode = StringUtils.StringUtils.getCharCode("A");
  for (let c = aUpperCharCode; c <= zUpperCharCode; c++) {
    CHAR_MAP2[C__namespace.MODE_UPPER][c] = c - aUpperCharCode + 2;
  }
  CHAR_MAP2[C__namespace.MODE_LOWER][spaceCharCode] = 1;
  const zLowerCharCode = StringUtils.StringUtils.getCharCode("z");
  const aLowerCharCode = StringUtils.StringUtils.getCharCode("a");
  for (let c = aLowerCharCode; c <= zLowerCharCode; c++) {
    CHAR_MAP2[C__namespace.MODE_LOWER][c] = c - aLowerCharCode + 2;
  }
  CHAR_MAP2[C__namespace.MODE_DIGIT][spaceCharCode] = 1;
  const nineCharCode = StringUtils.StringUtils.getCharCode("9");
  const zeroCharCode = StringUtils.StringUtils.getCharCode("0");
  for (let c = zeroCharCode; c <= nineCharCode; c++) {
    CHAR_MAP2[C__namespace.MODE_DIGIT][c] = c - zeroCharCode + 2;
  }
  CHAR_MAP2[C__namespace.MODE_DIGIT][commaCharCode] = 12;
  CHAR_MAP2[C__namespace.MODE_DIGIT][pointCharCode] = 13;
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
    CHAR_MAP2[C__namespace.MODE_MIXED][StringUtils.StringUtils.getCharCode(mixedTable[i])] = i;
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
    if (StringUtils.StringUtils.getCharCode(punctTable[i]) > 0) {
      CHAR_MAP2[C__namespace.MODE_PUNCT][StringUtils.StringUtils.getCharCode(punctTable[i])] = i;
    }
  }
  return CHAR_MAP2;
}
const CHAR_MAP = static_CHAR_MAP(ZXingArrays.ZXingArrays.createInt32Array(5, 256));

exports.CHAR_MAP = CHAR_MAP;
exports.static_CHAR_MAP = static_CHAR_MAP;
//# sourceMappingURL=CharMap.cjs.map
//# sourceMappingURL=CharMap.cjs.map