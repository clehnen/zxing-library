import { AI013x0xDecoder } from './AI013x0xDecoder';

class AI01320xDecoder extends AI013x0xDecoder {
  constructor(information) {
    super(information);
  }
  addWeightCode(buf, weight) {
    if (weight < 1e4) {
      buf.append("(3202)");
    } else {
      buf.append("(3203)");
    }
  }
  checkWeight(weight) {
    if (weight < 1e4) {
      return weight;
    }
    return weight - 1e4;
  }
}

export { AI01320xDecoder };
//# sourceMappingURL=AI01320xDecoder.js.map
//# sourceMappingURL=AI01320xDecoder.js.map