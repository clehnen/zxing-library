'use strict';

var BarcodeFormat = require('../BarcodeFormat');
var AbstractUPCEANReader = require('./AbstractUPCEANReader');
var Result = require('../Result');
var ResultPoint = require('../ResultPoint');
var ResultMetadataType = require('../ResultMetadataType');
var NotFoundException = require('../NotFoundException');

class UPCEANExtension2Support {
  decodeMiddleCounters = Int32Array.from([0, 0, 0, 0]);
  decodeRowStringBuffer = "";
  decodeRow(rowNumber, row, extensionStartRange) {
    let result = this.decodeRowStringBuffer;
    let end = this.decodeMiddle(row, extensionStartRange, result);
    let resultString = result.toString();
    let extensionData = UPCEANExtension2Support.parseExtensionString(resultString);
    let resultPoints = [
      new ResultPoint.ResultPoint((extensionStartRange[0] + extensionStartRange[1]) / 2, rowNumber),
      new ResultPoint.ResultPoint(end, rowNumber)
    ];
    let extensionResult = new Result.Result(resultString, null, 0, resultPoints, BarcodeFormat.BarcodeFormat.UPC_EAN_EXTENSION, (/* @__PURE__ */ new Date()).getTime());
    if (extensionData != null) {
      extensionResult.putAllMetadata(extensionData);
    }
    return extensionResult;
  }
  decodeMiddle(row, startRange, resultString) {
    let counters = this.decodeMiddleCounters;
    counters[0] = 0;
    counters[1] = 0;
    counters[2] = 0;
    counters[3] = 0;
    let end = row.getSize();
    let rowOffset = startRange[1];
    let checkParity = 0;
    for (let x = 0; x < 2 && rowOffset < end; x++) {
      let bestMatch = AbstractUPCEANReader.AbstractUPCEANReader.decodeDigit(row, counters, rowOffset, AbstractUPCEANReader.AbstractUPCEANReader.L_AND_G_PATTERNS);
      resultString += String.fromCharCode("0".charCodeAt(0) + bestMatch % 10);
      for (let counter of counters) {
        rowOffset += counter;
      }
      if (bestMatch >= 10) {
        checkParity |= 1 << 1 - x;
      }
      if (x !== 1) {
        rowOffset = row.getNextSet(rowOffset);
        rowOffset = row.getNextUnset(rowOffset);
      }
    }
    if (resultString.length !== 2) {
      throw new NotFoundException.NotFoundException();
    }
    if (parseInt(resultString.toString()) % 4 !== checkParity) {
      throw new NotFoundException.NotFoundException();
    }
    return rowOffset;
  }
  static parseExtensionString(raw) {
    if (raw.length !== 2) {
      return null;
    }
    return /* @__PURE__ */ new Map([[ResultMetadataType.ResultMetadataType.ISSUE_NUMBER, parseInt(raw)]]);
  }
}

exports.UPCEANExtension2Support = UPCEANExtension2Support;
//# sourceMappingURL=UPCEANExtension2Support.cjs.map
//# sourceMappingURL=UPCEANExtension2Support.cjs.map