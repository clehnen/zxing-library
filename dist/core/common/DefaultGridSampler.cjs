'use strict';

var GridSampler = require('./GridSampler');
var BitMatrix = require('./BitMatrix');
var PerspectiveTransform = require('./PerspectiveTransform');
var NotFoundException = require('../NotFoundException');

class DefaultGridSampler extends GridSampler.GridSampler {
  /*@Override*/
  sampleGrid(image, dimensionX, dimensionY, p1ToX, p1ToY, p2ToX, p2ToY, p3ToX, p3ToY, p4ToX, p4ToY, p1FromX, p1FromY, p2FromX, p2FromY, p3FromX, p3FromY, p4FromX, p4FromY) {
    const transform = PerspectiveTransform.PerspectiveTransform.quadrilateralToQuadrilateral(
      p1ToX,
      p1ToY,
      p2ToX,
      p2ToY,
      p3ToX,
      p3ToY,
      p4ToX,
      p4ToY,
      p1FromX,
      p1FromY,
      p2FromX,
      p2FromY,
      p3FromX,
      p3FromY,
      p4FromX,
      p4FromY
    );
    return this.sampleGridWithTransform(image, dimensionX, dimensionY, transform);
  }
  /*@Override*/
  sampleGridWithTransform(image, dimensionX, dimensionY, transform) {
    if (dimensionX <= 0 || dimensionY <= 0) {
      throw new NotFoundException.NotFoundException();
    }
    const bits = new BitMatrix.BitMatrix(dimensionX, dimensionY);
    const points = new Float32Array(2 * dimensionX);
    for (let y = 0; y < dimensionY; y++) {
      const max = points.length;
      const iValue = y + 0.5;
      for (let x = 0; x < max; x += 2) {
        points[x] = x / 2 + 0.5;
        points[x + 1] = iValue;
      }
      transform.transformPoints(points);
      GridSampler.GridSampler.checkAndNudgePoints(image, points);
      try {
        for (let x = 0; x < max; x += 2) {
          if (image.get(points[x] | 0, points[x + 1] | 0)) {
            bits.set(x / 2, y);
          }
        }
      } catch (aioobe) {
        throw new NotFoundException.NotFoundException();
      }
    }
    return bits;
  }
}

exports.DefaultGridSampler = DefaultGridSampler;
//# sourceMappingURL=DefaultGridSampler.cjs.map
//# sourceMappingURL=DefaultGridSampler.cjs.map