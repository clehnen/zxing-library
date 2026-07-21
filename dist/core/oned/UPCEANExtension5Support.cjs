'use strict';

var BarcodeFormat = require('../BarcodeFormat');
var AbstractUPCEANReader = require('./AbstractUPCEANReader');
var Result = require('../Result');
var ResultPoint = require('../ResultPoint');
var ResultMetadataType = require('../ResultMetadataType');
var NotFoundException = require('../NotFoundException');

class UPCEANExtension5Support {
  CHECK_DIGIT_ENCODINGS = [24, 20, 18, 17, 12, 6, 3, 10, 9, 5];
  decodeMiddleCounters = Int32Array.from([0, 0, 0, 0]);
  decodeRowStringBuffer = "";
  decodeRow(rowNumber, row, extensionStartRange) {
    let result = this.decodeRowStringBuffer;
    let end = this.decodeMiddle(row, extensionStartRange, result);
    let resultString = result.toString();
    let extensionData = UPCEANExtension5Support.parseExtensionString(resultString);
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
    let lgPatternFound = 0;
    for (let x = 0; x < 5 && rowOffset < end; x++) {
      let bestMatch = AbstractUPCEANReader.AbstractUPCEANReader.decodeDigit(row, counters, rowOffset, AbstractUPCEANReader.AbstractUPCEANReader.L_AND_G_PATTERNS);
      resultString += String.fromCharCode("0".charCodeAt(0) + bestMatch % 10);
      for (let counter of counters) {
        rowOffset += counter;
      }
      if (bestMatch >= 10) {
        lgPatternFound |= 1 << 4 - x;
      }
      if (x !== 4) {
        rowOffset = row.getNextSet(rowOffset);
        rowOffset = row.getNextUnset(rowOffset);
      }
    }
    if (resultString.length !== 5) {
      throw new NotFoundException.NotFoundException();
    }
    let checkDigit = this.determineCheckDigit(lgPatternFound);
    if (UPCEANExtension5Support.extensionChecksum(resultString.toString()) !== checkDigit) {
      throw new NotFoundException.NotFoundException();
    }
    return rowOffset;
  }
  static extensionChecksum(s) {
    let length = s.length;
    let sum = 0;
    for (let i = length - 2; i >= 0; i -= 2) {
      sum += s.charAt(i).charCodeAt(0) - "0".charCodeAt(0);
    }
    sum *= 3;
    for (let i = length - 1; i >= 0; i -= 2) {
      sum += s.charAt(i).charCodeAt(0) - "0".charCodeAt(0);
    }
    sum *= 3;
    return sum % 10;
  }
  determineCheckDigit(lgPatternFound) {
    for (let d = 0; d < 10; d++) {
      if (lgPatternFound === this.CHECK_DIGIT_ENCODINGS[d]) {
        return d;
      }
    }
    throw new NotFoundException.NotFoundException();
  }
  static parseExtensionString(raw) {
    if (raw.length !== 5) {
      return null;
    }
    let value = UPCEANExtension5Support.parseExtension5String(raw);
    if (value == null) {
      return null;
    }
    return /* @__PURE__ */ new Map([[ResultMetadataType.ResultMetadataType.SUGGESTED_PRICE, value]]);
  }
  static parseExtension5String(raw) {
    let currency;
    switch (raw.charAt(0)) {
      case "0":
        currency = "\xA3";
        break;
      case "5":
        currency = "$";
        break;
      case "9":
        switch (raw) {
          case "90000":
            return null;
          case "99991":
            return "0.00";
          case "99990":
            return "Used";
        }
        currency = "";
        break;
      default:
        currency = "";
        break;
    }
    let rawAmount = parseInt(raw.substring(1));
    let unitsString = (rawAmount / 100).toString();
    let hundredths = rawAmount % 100;
    let hundredthsString = hundredths < 10 ? "0" + hundredths : hundredths.toString();
    return currency + unitsString + "." + hundredthsString;
  }
}

exports.UPCEANExtension5Support = UPCEANExtension5Support;
//# sourceMappingURL=UPCEANExtension5Support.cjs.map
//# sourceMappingURL=UPCEANExtension5Support.cjs.map