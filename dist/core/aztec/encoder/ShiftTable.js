import { ZXingArrays } from '../../util/ZXingArrays';
import * as C from './EncoderConstants';

function static_SHIFT_TABLE(SHIFT_TABLE2) {
  for (let table of SHIFT_TABLE2) {
    ZXingArrays.fill(table, -1);
  }
  SHIFT_TABLE2[C.MODE_UPPER][C.MODE_PUNCT] = 0;
  SHIFT_TABLE2[C.MODE_LOWER][C.MODE_PUNCT] = 0;
  SHIFT_TABLE2[C.MODE_LOWER][C.MODE_UPPER] = 28;
  SHIFT_TABLE2[C.MODE_MIXED][C.MODE_PUNCT] = 0;
  SHIFT_TABLE2[C.MODE_DIGIT][C.MODE_PUNCT] = 0;
  SHIFT_TABLE2[C.MODE_DIGIT][C.MODE_UPPER] = 15;
  return SHIFT_TABLE2;
}
const SHIFT_TABLE = static_SHIFT_TABLE(ZXingArrays.createInt32Array(6, 6));
var ShiftTable_default = {
  SHIFT_TABLE
};

export { SHIFT_TABLE, ShiftTable_default as default, static_SHIFT_TABLE };
//# sourceMappingURL=ShiftTable.js.map
//# sourceMappingURL=ShiftTable.js.map