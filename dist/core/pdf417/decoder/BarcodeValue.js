import { PDF417Common } from '../PDF417Common';

class BarcodeValue {
  values = /* @__PURE__ */ new Map();
  /**
   * Add an occurrence of a value
   */
  setValue(value) {
    value = Math.trunc(value);
    let confidence = this.values.get(value);
    if (confidence == null) {
      confidence = 0;
    }
    confidence++;
    this.values.set(value, confidence);
  }
  /**
   * Determines the maximum occurrence of a set value and returns all values which were set with this occurrence.
   * @return an array of int, containing the values with the highest occurrence, or null, if no value was set
   */
  getValue() {
    let maxConfidence = -1;
    let result = new Array();
    for (const [key, value] of this.values.entries()) {
      const entry = {
        getKey: () => key,
        getValue: () => value
      };
      if (entry.getValue() > maxConfidence) {
        maxConfidence = entry.getValue();
        result = [];
        result.push(entry.getKey());
      } else if (entry.getValue() === maxConfidence) {
        result.push(entry.getKey());
      }
    }
    return PDF417Common.toIntArray(result);
  }
  getConfidence(value) {
    return this.values.get(value);
  }
}

export { BarcodeValue };
//# sourceMappingURL=BarcodeValue.js.map
//# sourceMappingURL=BarcodeValue.js.map