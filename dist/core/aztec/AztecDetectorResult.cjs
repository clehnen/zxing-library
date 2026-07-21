'use strict';

var DetectorResult = require('../common/DetectorResult');

class AztecDetectorResult extends DetectorResult.DetectorResult {
  compact;
  nbDatablocks;
  nbLayers;
  constructor(bits, points, compact, nbDatablocks, nbLayers) {
    super(bits, points);
    this.compact = compact;
    this.nbDatablocks = nbDatablocks;
    this.nbLayers = nbLayers;
  }
  getNbLayers() {
    return this.nbLayers;
  }
  getNbDatablocks() {
    return this.nbDatablocks;
  }
  isCompact() {
    return this.compact;
  }
}

exports.AztecDetectorResult = AztecDetectorResult;
//# sourceMappingURL=AztecDetectorResult.cjs.map
//# sourceMappingURL=AztecDetectorResult.cjs.map