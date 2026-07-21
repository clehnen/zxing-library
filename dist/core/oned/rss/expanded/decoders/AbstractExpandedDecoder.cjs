'use strict';

var GeneralAppIdDecoder = require('./GeneralAppIdDecoder');

class AbstractExpandedDecoder {
  information;
  generalDecoder;
  constructor(information) {
    this.information = information;
    this.generalDecoder = new GeneralAppIdDecoder.GeneralAppIdDecoder(information);
  }
  getInformation() {
    return this.information;
  }
  getGeneralDecoder() {
    return this.generalDecoder;
  }
  // createDecoder moved to own file due to circular dependency
}

exports.AbstractExpandedDecoder = AbstractExpandedDecoder;
//# sourceMappingURL=AbstractExpandedDecoder.cjs.map
//# sourceMappingURL=AbstractExpandedDecoder.cjs.map