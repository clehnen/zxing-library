'use strict';

var BarcodeFormat = require('../BarcodeFormat');
var DecodeHintType = require('../DecodeHintType');
var Result = require('../Result');
var ResultMetadataType = require('../ResultMetadataType');
var ResultPoint = require('../ResultPoint');
var UPCEANExtensionSupport = require('./UPCEANExtensionSupport');
var AbstractUPCEANReader = require('./AbstractUPCEANReader');
var NotFoundException = require('../NotFoundException');
var FormatException = require('../FormatException');
var ChecksumException = require('../ChecksumException');

class UPCEANReader extends AbstractUPCEANReader.AbstractUPCEANReader {
  constructor() {
    super();
    this.decodeRowStringBuffer = "";
    UPCEANReader.L_AND_G_PATTERNS = UPCEANReader.L_PATTERNS.map((arr) => Int32Array.from(arr));
    for (let i = 10; i < 20; i++) {
      let widths = UPCEANReader.L_PATTERNS[i - 10];
      let reversedWidths = new Int32Array(widths.length);
      for (let j = 0; j < widths.length; j++) {
        reversedWidths[j] = widths[widths.length - j - 1];
      }
      UPCEANReader.L_AND_G_PATTERNS[i] = reversedWidths;
    }
  }
  decodeRow(rowNumber, row, hints) {
    let startGuardRange = UPCEANReader.findStartGuardPattern(row);
    let resultPointCallback = hints == null ? null : hints.get(DecodeHintType.DecodeHintType.NEED_RESULT_POINT_CALLBACK);
    if (resultPointCallback != null) {
      const resultPoint2 = new ResultPoint.ResultPoint((startGuardRange[0] + startGuardRange[1]) / 2, rowNumber);
      resultPointCallback.foundPossibleResultPoint(resultPoint2);
    }
    let budello = this.decodeMiddle(row, startGuardRange, this.decodeRowStringBuffer);
    let endStart = budello.rowOffset;
    let result = budello.resultString;
    if (resultPointCallback != null) {
      const resultPoint2 = new ResultPoint.ResultPoint(endStart, rowNumber);
      resultPointCallback.foundPossibleResultPoint(resultPoint2);
    }
    let endRange = UPCEANReader.decodeEnd(row, endStart);
    if (resultPointCallback != null) {
      const resultPoint2 = new ResultPoint.ResultPoint((endRange[0] + endRange[1]) / 2, rowNumber);
      resultPointCallback.foundPossibleResultPoint(resultPoint2);
    }
    let end = endRange[1];
    let quietEnd = end + (end - endRange[0]);
    if (quietEnd >= row.getSize() || !row.isRange(end, quietEnd, false)) {
      throw new NotFoundException.NotFoundException();
    }
    let resultString = result.toString();
    if (resultString.length < 8) {
      throw new FormatException.FormatException();
    }
    if (!UPCEANReader.checkChecksum(resultString)) {
      throw new ChecksumException.ChecksumException();
    }
    let left = (startGuardRange[1] + startGuardRange[0]) / 2;
    let right = (endRange[1] + endRange[0]) / 2;
    let format = this.getBarcodeFormat();
    let resultPoint = [new ResultPoint.ResultPoint(left, rowNumber), new ResultPoint.ResultPoint(right, rowNumber)];
    let decodeResult = new Result.Result(resultString, null, 0, resultPoint, format, (/* @__PURE__ */ new Date()).getTime());
    let extensionLength = 0;
    try {
      let extensionResult = UPCEANExtensionSupport.UPCEANExtensionSupport.decodeRow(rowNumber, row, endRange[1]);
      decodeResult.putMetadata(ResultMetadataType.ResultMetadataType.UPC_EAN_EXTENSION, extensionResult.getText());
      decodeResult.putAllMetadata(extensionResult.getResultMetadata());
      decodeResult.addResultPoints(extensionResult.getResultPoints());
      extensionLength = extensionResult.getText().length;
    } catch (err) {
    }
    let allowedExtensions = hints == null ? null : hints.get(DecodeHintType.DecodeHintType.ALLOWED_EAN_EXTENSIONS);
    if (allowedExtensions != null) {
      let valid = false;
      for (let length in allowedExtensions) {
        if (extensionLength.toString() === length) {
          valid = true;
          break;
        }
      }
      if (!valid) {
        throw new NotFoundException.NotFoundException();
      }
    }
    if (format === BarcodeFormat.BarcodeFormat.EAN_13 || format === BarcodeFormat.BarcodeFormat.UPC_A) ;
    return decodeResult;
  }
  static checkChecksum(s) {
    return UPCEANReader.checkStandardUPCEANChecksum(s);
  }
  static checkStandardUPCEANChecksum(s) {
    let length = s.length;
    if (length === 0) return false;
    let check = parseInt(s.charAt(length - 1), 10);
    return UPCEANReader.getStandardUPCEANChecksum(s.substring(0, length - 1)) === check;
  }
  static getStandardUPCEANChecksum(s) {
    let length = s.length;
    let sum = 0;
    for (let i = length - 1; i >= 0; i -= 2) {
      let digit = s.charAt(i).charCodeAt(0) - "0".charCodeAt(0);
      if (digit < 0 || digit > 9) {
        throw new FormatException.FormatException();
      }
      sum += digit;
    }
    sum *= 3;
    for (let i = length - 2; i >= 0; i -= 2) {
      let digit = s.charAt(i).charCodeAt(0) - "0".charCodeAt(0);
      if (digit < 0 || digit > 9) {
        throw new FormatException.FormatException();
      }
      sum += digit;
    }
    return (1e3 - sum) % 10;
  }
  static decodeEnd(row, endStart) {
    return UPCEANReader.findGuardPattern(row, endStart, false, UPCEANReader.START_END_PATTERN, new Int32Array(UPCEANReader.START_END_PATTERN.length).fill(0));
  }
}

exports.UPCEANReader = UPCEANReader;
//# sourceMappingURL=UPCEANReader.cjs.map
//# sourceMappingURL=UPCEANReader.cjs.map