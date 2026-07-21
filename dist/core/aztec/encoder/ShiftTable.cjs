'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var ZXingArrays = require('../../util/ZXingArrays');
var C = require('./EncoderConstants');

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

function static_SHIFT_TABLE(SHIFT_TABLE2) {
  for (let table of SHIFT_TABLE2) {
    ZXingArrays.ZXingArrays.fill(table, -1);
  }
  SHIFT_TABLE2[C__namespace.MODE_UPPER][C__namespace.MODE_PUNCT] = 0;
  SHIFT_TABLE2[C__namespace.MODE_LOWER][C__namespace.MODE_PUNCT] = 0;
  SHIFT_TABLE2[C__namespace.MODE_LOWER][C__namespace.MODE_UPPER] = 28;
  SHIFT_TABLE2[C__namespace.MODE_MIXED][C__namespace.MODE_PUNCT] = 0;
  SHIFT_TABLE2[C__namespace.MODE_DIGIT][C__namespace.MODE_PUNCT] = 0;
  SHIFT_TABLE2[C__namespace.MODE_DIGIT][C__namespace.MODE_UPPER] = 15;
  return SHIFT_TABLE2;
}
const SHIFT_TABLE = static_SHIFT_TABLE(ZXingArrays.ZXingArrays.createInt32Array(6, 6));
var ShiftTable_default = {
  SHIFT_TABLE
};

exports.SHIFT_TABLE = SHIFT_TABLE;
exports.default = ShiftTable_default;
exports.static_SHIFT_TABLE = static_SHIFT_TABLE;
//# sourceMappingURL=ShiftTable.cjs.map
//# sourceMappingURL=ShiftTable.cjs.map