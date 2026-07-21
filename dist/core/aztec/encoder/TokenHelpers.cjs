'use strict';

var SimpleToken = require('./SimpleToken');
var BinaryShiftToken = require('./BinaryShiftToken');

function addBinaryShift(token, start, byteCount) {
  return new BinaryShiftToken.BinaryShiftToken(token, start, byteCount);
}
function add(token, value, bitCount) {
  return new SimpleToken.SimpleToken(token, value, bitCount);
}

exports.add = add;
exports.addBinaryShift = addBinaryShift;
//# sourceMappingURL=TokenHelpers.cjs.map
//# sourceMappingURL=TokenHelpers.cjs.map