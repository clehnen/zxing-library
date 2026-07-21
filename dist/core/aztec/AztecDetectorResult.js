import { DetectorResult } from '../common/DetectorResult';

class AztecDetectorResult extends DetectorResult {
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

export { AztecDetectorResult };
//# sourceMappingURL=AztecDetectorResult.js.map
//# sourceMappingURL=AztecDetectorResult.js.map