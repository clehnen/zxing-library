import { AbstractUPCEANReader } from './AbstractUPCEANReader';
import { UPCEANExtension5Support } from './UPCEANExtension5Support';
import { UPCEANExtension2Support } from './UPCEANExtension2Support';

class UPCEANExtensionSupport {
  static EXTENSION_START_PATTERN = Int32Array.from([1, 1, 2]);
  static decodeRow(rowNumber, row, rowOffset) {
    let extensionStartRange = AbstractUPCEANReader.findGuardPattern(row, rowOffset, false, this.EXTENSION_START_PATTERN, new Int32Array(this.EXTENSION_START_PATTERN.length).fill(0));
    try {
      let fiveSupport = new UPCEANExtension5Support();
      return fiveSupport.decodeRow(rowNumber, row, extensionStartRange);
    } catch (err) {
      let twoSupport = new UPCEANExtension2Support();
      return twoSupport.decodeRow(rowNumber, row, extensionStartRange);
    }
  }
}

export { UPCEANExtensionSupport };
//# sourceMappingURL=UPCEANExtensionSupport.js.map
//# sourceMappingURL=UPCEANExtensionSupport.js.map