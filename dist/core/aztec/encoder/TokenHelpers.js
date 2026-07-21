import { SimpleToken } from './SimpleToken';
import { BinaryShiftToken } from './BinaryShiftToken';

function addBinaryShift(token, start, byteCount) {
  return new BinaryShiftToken(token, start, byteCount);
}
function add(token, value, bitCount) {
  return new SimpleToken(token, value, bitCount);
}

export { add, addBinaryShift };
//# sourceMappingURL=TokenHelpers.js.map
//# sourceMappingURL=TokenHelpers.js.map