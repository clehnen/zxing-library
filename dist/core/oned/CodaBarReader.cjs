'use strict';

var BarcodeFormat = require('../BarcodeFormat');
var NotFoundException = require('../NotFoundException');
var OneDReader = require('./OneDReader');
var Result = require('../Result');
var ResultPoint = require('../ResultPoint');

class CodaBarReader extends OneDReader.OneDReader {
  CODA_BAR_CHAR_SET = {
    nnnnnww: "0",
    nnnnwwn: "1",
    nnnwnnw: "2",
    wwnnnnn: "3",
    nnwnnwn: "4",
    wnnnnwn: "5",
    nwnnnnw: "6",
    nwnnwnn: "7",
    nwwnnnn: "8",
    wnnwnnn: "9",
    nnnwwnn: "-",
    nnwwnnn: "$",
    wnnnwnw: ":",
    wnwnnnw: "/",
    wnwnwnn: ".",
    nnwwwww: "+",
    nnwwnwn: "A",
    nwnwnnw: "B",
    nnnwnww: "C",
    nnnwwwn: "D"
  };
  decodeRow(rowNumber, row, hints) {
    let validRowData = this.getValidRowData(row);
    if (!validRowData) throw new NotFoundException.NotFoundException();
    let retStr = this.codaBarDecodeRow(validRowData.row);
    if (!retStr) throw new NotFoundException.NotFoundException();
    return new Result.Result(
      retStr,
      null,
      0,
      [new ResultPoint.ResultPoint(validRowData.left, rowNumber), new ResultPoint.ResultPoint(validRowData.right, rowNumber)],
      BarcodeFormat.BarcodeFormat.CODABAR,
      (/* @__PURE__ */ new Date()).getTime()
    );
  }
  /**
   * converts bit array to valid data array(lengths of black bits and white bits)
   * @param row bit array to convert
   */
  getValidRowData(row) {
    let booleanArr = row.toArray();
    let startIndex = booleanArr.indexOf(true);
    if (startIndex === -1) return null;
    let lastIndex = booleanArr.lastIndexOf(true);
    if (lastIndex <= startIndex) return null;
    booleanArr = booleanArr.slice(startIndex, lastIndex + 1);
    let result = [];
    let lastBit = booleanArr[0];
    let bitLength = 1;
    for (let i = 1; i < booleanArr.length; i++) {
      if (booleanArr[i] === lastBit) {
        bitLength++;
      } else {
        lastBit = booleanArr[i];
        result.push(bitLength);
        bitLength = 1;
      }
    }
    result.push(bitLength);
    if (result.length < 23 && (result.length + 1) % 8 !== 0)
      return null;
    return { row: result, left: startIndex, right: lastIndex };
  }
  /**
   * decode codabar code
   * @param row row to cecode
   */
  codaBarDecodeRow(row) {
    const code = [];
    const barThreshold = Math.ceil(
      row.reduce((pre, item) => (pre + item) / 2, 0)
    );
    while (row.length > 0) {
      const seg = row.splice(0, 8).splice(0, 7);
      const key = seg.map((len) => len < barThreshold ? "n" : "w").join("");
      if (this.CODA_BAR_CHAR_SET[key] === void 0) return null;
      code.push(this.CODA_BAR_CHAR_SET[key]);
    }
    let strCode = code.join("");
    if (this.validCodaBarString(strCode)) return strCode;
    return null;
  }
  /**
   * check if the string is a CodaBar string
   * @param src string to determine
   */
  validCodaBarString(src) {
    let reg = /^[A-D].{1,}[A-D]$/;
    return reg.test(src);
  }
}

exports.CodaBarReader = CodaBarReader;
//# sourceMappingURL=CodaBarReader.cjs.map
//# sourceMappingURL=CodaBarReader.cjs.map