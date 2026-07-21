import { SimpleToken } from './SimpleToken';

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
const EMPTY_TOKEN = new SimpleToken(null, 0, 0);
var EncoderConstants_default = {
  MODE_NAMES,
  MODE_UPPER,
  MODE_LOWER,
  MODE_DIGIT,
  MODE_MIXED,
  MODE_PUNCT,
  EMPTY_TOKEN
};

export { EMPTY_TOKEN, MODE_DIGIT, MODE_LOWER, MODE_MIXED, MODE_NAMES, MODE_PUNCT, MODE_UPPER, EncoderConstants_default as default };
//# sourceMappingURL=EncoderConstants.js.map
//# sourceMappingURL=EncoderConstants.js.map