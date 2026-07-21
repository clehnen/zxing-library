import { GeneralAppIdDecoder } from './GeneralAppIdDecoder';

class AbstractExpandedDecoder {
  information;
  generalDecoder;
  constructor(information) {
    this.information = information;
    this.generalDecoder = new GeneralAppIdDecoder(information);
  }
  getInformation() {
    return this.information;
  }
  getGeneralDecoder() {
    return this.generalDecoder;
  }
  // createDecoder moved to own file due to circular dependency
}

export { AbstractExpandedDecoder };
//# sourceMappingURL=AbstractExpandedDecoder.js.map
//# sourceMappingURL=AbstractExpandedDecoder.js.map