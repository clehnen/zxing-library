class QRCodeDecoderMetaData {
  constructor(mirrored) {
    this.mirrored = mirrored;
  }
  mirrored;
  /**
   * @return true if the QR Code was mirrored.
   */
  isMirrored() {
    return this.mirrored;
  }
  /**
   * Apply the result points' order correction due to mirroring.
   *
   * @param points Array of points to apply mirror correction to.
   */
  applyMirroredCorrection(points) {
    if (!this.mirrored || points === null || points.length < 3) {
      return;
    }
    const bottomLeft = points[0];
    points[0] = points[2];
    points[2] = bottomLeft;
  }
}

export { QRCodeDecoderMetaData };
//# sourceMappingURL=QRCodeDecoderMetaData.js.map
//# sourceMappingURL=QRCodeDecoderMetaData.js.map