'use strict';

var AbstractUPCEANReader = require('./AbstractUPCEANReader');
var UPCEANExtension5Support = require('./UPCEANExtension5Support');
var UPCEANExtension2Support = require('./UPCEANExtension2Support');

class UPCEANExtensionSupport {
  static EXTENSION_START_PATTERN = Int32Array.from([1, 1, 2]);
  static decodeRow(rowNumber, row, rowOffset) {
    let extensionStartRange = AbstractUPCEANReader.AbstractUPCEANReader.findGuardPattern(row, rowOffset, false, this.EXTENSION_START_PATTERN, new Int32Array(this.EXTENSION_START_PATTERN.length).fill(0));
    try {
      let fiveSupport = new UPCEANExtension5Support.UPCEANExtension5Support();
      return fiveSupport.decodeRow(rowNumber, row, extensionStartRange);
    } catch (err) {
      let twoSupport = new UPCEANExtension2Support.UPCEANExtension2Support();
      return twoSupport.decodeRow(rowNumber, row, extensionStartRange);
    }
  }
}

exports.UPCEANExtensionSupport = UPCEANExtensionSupport;
//# sourceMappingURL=UPCEANExtensionSupport.cjs.map
//# sourceMappingURL=UPCEANExtensionSupport.cjs.map