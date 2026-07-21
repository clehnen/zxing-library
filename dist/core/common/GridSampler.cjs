'use strict';

var NotFoundException = require('../NotFoundException');

class GridSampler {
  /*throws NotFoundException*/
  /**
   * <p>Checks a set of points that have been transformed to sample points on an image against
   * the image's dimensions to see if the point are even within the image.</p>
   *
   * <p>This method will actually "nudge" the endpoints back onto the image if they are found to be
   * barely (less than 1 pixel) off the image. This accounts for imperfect detection of finder
   * patterns in an image where the QR Code runs all the way to the image border.</p>
   *
   * <p>For efficiency, the method will check points from either end of the line until one is found
   * to be within the image. Because the set of points are assumed to be linear, this is valid.</p>
   *
   * @param image image into which the points should map
   * @param points actual points in x1,y1,...,xn,yn form
   * @throws NotFoundException if an endpoint is lies outside the image boundaries
   */
  static checkAndNudgePoints(image, points) {
    const width = image.getWidth();
    const height = image.getHeight();
    let nudged = true;
    for (let offset = 0; offset < points.length && nudged; offset += 2) {
      const x = Math.floor(points[offset]);
      const y = Math.floor(points[offset + 1]);
      if (x < -1 || x > width || y < -1 || y > height) {
        throw new NotFoundException.NotFoundException();
      }
      nudged = false;
      if (x === -1) {
        points[offset] = 0;
        nudged = true;
      } else if (x === width) {
        points[offset] = width - 1;
        nudged = true;
      }
      if (y === -1) {
        points[offset + 1] = 0;
        nudged = true;
      } else if (y === height) {
        points[offset + 1] = height - 1;
        nudged = true;
      }
    }
    nudged = true;
    for (let offset = points.length - 2; offset >= 0 && nudged; offset -= 2) {
      const x = Math.floor(points[offset]);
      const y = Math.floor(points[offset + 1]);
      if (x < -1 || x > width || y < -1 || y > height) {
        throw new NotFoundException.NotFoundException();
      }
      nudged = false;
      if (x === -1) {
        points[offset] = 0;
        nudged = true;
      } else if (x === width) {
        points[offset] = width - 1;
        nudged = true;
      }
      if (y === -1) {
        points[offset + 1] = 0;
        nudged = true;
      } else if (y === height) {
        points[offset + 1] = height - 1;
        nudged = true;
      }
    }
  }
}

exports.GridSampler = GridSampler;
//# sourceMappingURL=GridSampler.cjs.map
//# sourceMappingURL=GridSampler.cjs.map