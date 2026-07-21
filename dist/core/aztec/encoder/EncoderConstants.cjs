'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var SimpleToken = require('./SimpleToken');

const MODE_NAMES = [
  "UPPER",
  "LOWER",
  "DIGIT",
  "MIXED",
  "PUNCT"
];
const MODE_UPPER = 0;
const MODE_LOWER = 1;
const MODE_DIGIT = 2;
const MODE_MIXED = 3;
const MODE_PUNCT = 4;
const EMPTY_TOKEN = new SimpleToken.SimpleToken(null, 0, 0);
var EncoderConstants_default = {
  MODE_NAMES,
  MODE_UPPER,
  MODE_LOWER,
  MODE_DIGIT,
  MODE_MIXED,
  MODE_PUNCT,
  EMPTY_TOKEN
};

exports.EMPTY_TOKEN = EMPTY_TOKEN;
exports.MODE_DIGIT = MODE_DIGIT;
exports.MODE_LOWER = MODE_LOWER;
exports.MODE_MIXED = MODE_MIXED;
exports.MODE_NAMES = MODE_NAMES;
exports.MODE_PUNCT = MODE_PUNCT;
exports.MODE_UPPER = MODE_UPPER;
exports.default = EncoderConstants_default;
//# sourceMappingURL=EncoderConstants.cjs.map
//# sourceMappingURL=EncoderConstants.cjs.map