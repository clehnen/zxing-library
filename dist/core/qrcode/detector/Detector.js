import { MathUtils } from '../../common/detector/MathUtils';
import { DetectorResult } from '../../common/DetectorResult';
import { GridSamplerInstance } from '../../common/GridSamplerInstance';
import { PerspectiveTransform } from '../../common/PerspectiveTransform';
import { DecodeHintType } from '../../DecodeHintType';
import { NotFoundException } from '../../NotFoundException';
import { ResultPoint } from '../../ResultPoint';
import { QRCodeVersion } from '../decoder/QRCodeVersion';
import { AlignmentPatternFinder } from './AlignmentPatternFinder';
import { FinderPatternFinder } from './FinderPatternFinder';

class Detector {
  constructor(image) {
    this.image = image;
  }
  image;
  resultPointCallback;
  getImage() {
    return this.image;
  }
  getResultPointCallback() {
    return this.resultPointCallback;
  }
  /**
   * <p>Detects a QR Code in an image.</p>
   *
   * @return {@link DetectorResult} encapsulating results of detecting a QR Code
   * @throws NotFoundException if QR Code cannot be found
   * @throws FormatException if a QR Code cannot be decoded
   */
  // public detect(): DetectorResult /*throws NotFoundException, FormatException*/ {
  //   return detect(null)
  // }
  /**
   * <p>Detects a QR Code in an image.</p>
   *
   * @param hints optional hints to detector
   * @return {@link DetectorResult} encapsulating results of detecting a QR Code
   * @throws NotFoundException if QR Code cannot be found
   * @throws FormatException if a QR Code cannot be decoded
   */
  detect(hints) {
    this.resultPointCallback = hints === null || hints === void 0 ? null : (
      /*(ResultPointCallback) */
      hints.get(DecodeHintType.NEED_RESULT_POINT_CALLBACK)
    );
    const finder = new FinderPatternFinder(this.image, this.resultPointCallback);
    const info = finder.find(hints);
    return this.processFinderPatternInfo(info);
  }
  processFinderPatternInfo(info) {
    const topLeft = info.getTopLeft();
    const topRight = info.getTopRight();
    const bottomLeft = info.getBottomLeft();
    const moduleSize = this.calculateModuleSize(topLeft, topRight, bottomLeft);
    if (moduleSize < 1) {
      throw new NotFoundException("No pattern found in proccess finder.");
    }
    const dimension = Detector.computeDimension(topLeft, topRight, bottomLeft, moduleSize);
    const provisionalVersion = QRCodeVersion.getProvisionalVersionForDimension(dimension);
    const modulesBetweenFPCenters = provisionalVersion.getDimensionForVersion() - 7;
    let alignmentPattern = null;
    if (provisionalVersion.getAlignmentPatternCenters().length > 0) {
      const bottomRightX = topRight.getX() - topLeft.getX() + bottomLeft.getX();
      const bottomRightY = topRight.getY() - topLeft.getY() + bottomLeft.getY();
      const correctionToTopLeft = 1 - 3 / modulesBetweenFPCenters;
      const estAlignmentX = (
        /*(int) */
        Math.floor(topLeft.getX() + correctionToTopLeft * (bottomRightX - topLeft.getX()))
      );
      const estAlignmentY = (
        /*(int) */
        Math.floor(topLeft.getY() + correctionToTopLeft * (bottomRightY - topLeft.getY()))
      );
      for (let i = 4; i <= 16; i <<= 1) {
        try {
          alignmentPattern = this.findAlignmentInRegion(
            moduleSize,
            estAlignmentX,
            estAlignmentY,
            i
          );
          break;
        } catch (re) {
          if (!(re instanceof NotFoundException)) {
            throw re;
          }
        }
      }
    }
    const transform = Detector.createTransform(topLeft, topRight, bottomLeft, alignmentPattern, dimension);
    const bits = Detector.sampleGrid(this.image, transform, dimension);
    let points;
    if (alignmentPattern === null) {
      points = [bottomLeft, topLeft, topRight];
    } else {
      points = [bottomLeft, topLeft, topRight, alignmentPattern];
    }
    return new DetectorResult(bits, points);
  }
  static createTransform(topLeft, topRight, bottomLeft, alignmentPattern, dimension) {
    const dimMinusThree = dimension - 3.5;
    let bottomRightX;
    let bottomRightY;
    let sourceBottomRightX;
    let sourceBottomRightY;
    if (alignmentPattern !== null) {
      bottomRightX = alignmentPattern.getX();
      bottomRightY = alignmentPattern.getY();
      sourceBottomRightX = dimMinusThree - 3;
      sourceBottomRightY = sourceBottomRightX;
    } else {
      bottomRightX = topRight.getX() - topLeft.getX() + bottomLeft.getX();
      bottomRightY = topRight.getY() - topLeft.getY() + bottomLeft.getY();
      sourceBottomRightX = dimMinusThree;
      sourceBottomRightY = dimMinusThree;
    }
    return PerspectiveTransform.quadrilateralToQuadrilateral(
      3.5,
      3.5,
      dimMinusThree,
      3.5,
      sourceBottomRightX,
      sourceBottomRightY,
      3.5,
      dimMinusThree,
      topLeft.getX(),
      topLeft.getY(),
      topRight.getX(),
      topRight.getY(),
      bottomRightX,
      bottomRightY,
      bottomLeft.getX(),
      bottomLeft.getY()
    );
  }
  static sampleGrid(image, transform, dimension) {
    const sampler = GridSamplerInstance.getInstance();
    return sampler.sampleGridWithTransform(image, dimension, dimension, transform);
  }
  /**
   * <p>Computes the dimension (number of modules on a size) of the QR Code based on the position
   * of the finder patterns and estimated module size.</p>
   */
  static computeDimension(topLeft, topRight, bottomLeft, moduleSize) {
    const tltrCentersDimension = MathUtils.round(ResultPoint.distance(topLeft, topRight) / moduleSize);
    const tlblCentersDimension = MathUtils.round(ResultPoint.distance(topLeft, bottomLeft) / moduleSize);
    let dimension = Math.floor((tltrCentersDimension + tlblCentersDimension) / 2) + 7;
    switch (dimension & 3) {
      // mod 4
      case 0:
        dimension++;
        break;
      // 1? do nothing
      case 2:
        dimension--;
        break;
      case 3:
        throw new NotFoundException("Dimensions could be not found.");
    }
    return dimension;
  }
  /**
   * <p>Computes an average estimated module size based on estimated derived from the positions
   * of the three finder patterns.</p>
   *
   * @param topLeft detected top-left finder pattern center
   * @param topRight detected top-right finder pattern center
   * @param bottomLeft detected bottom-left finder pattern center
   * @return estimated module size
   */
  calculateModuleSize(topLeft, topRight, bottomLeft) {
    return (this.calculateModuleSizeOneWay(topLeft, topRight) + this.calculateModuleSizeOneWay(topLeft, bottomLeft)) / 2;
  }
  /**
   * <p>Estimates module size based on two finder patterns -- it uses
   * {@link #sizeOfBlackWhiteBlackRunBothWays(int, int, int, int)} to figure the
   * width of each, measuring along the axis between their centers.</p>
   */
  calculateModuleSizeOneWay(pattern, otherPattern) {
    const moduleSizeEst1 = this.sizeOfBlackWhiteBlackRunBothWays(
      /*(int) */
      Math.floor(pattern.getX()),
      /*(int) */
      Math.floor(pattern.getY()),
      /*(int) */
      Math.floor(otherPattern.getX()),
      /*(int) */
      Math.floor(otherPattern.getY())
    );
    const moduleSizeEst2 = this.sizeOfBlackWhiteBlackRunBothWays(
      /*(int) */
      Math.floor(otherPattern.getX()),
      /*(int) */
      Math.floor(otherPattern.getY()),
      /*(int) */
      Math.floor(pattern.getX()),
      /*(int) */
      Math.floor(pattern.getY())
    );
    if (isNaN(moduleSizeEst1)) {
      return moduleSizeEst2 / 7;
    }
    if (isNaN(moduleSizeEst2)) {
      return moduleSizeEst1 / 7;
    }
    return (moduleSizeEst1 + moduleSizeEst2) / 14;
  }
  /**
   * See {@link #sizeOfBlackWhiteBlackRun(int, int, int, int)}; computes the total width of
   * a finder pattern by looking for a black-white-black run from the center in the direction
   * of another point (another finder pattern center), and in the opposite direction too.
   */
  sizeOfBlackWhiteBlackRunBothWays(fromX, fromY, toX, toY) {
    let result = this.sizeOfBlackWhiteBlackRun(fromX, fromY, toX, toY);
    let scale = 1;
    let otherToX = fromX - (toX - fromX);
    if (otherToX < 0) {
      scale = fromX / /*(float) */
      (fromX - otherToX);
      otherToX = 0;
    } else if (otherToX >= this.image.getWidth()) {
      scale = (this.image.getWidth() - 1 - fromX) / /*(float) */
      (otherToX - fromX);
      otherToX = this.image.getWidth() - 1;
    }
    let otherToY = (
      /*(int) */
      Math.floor(fromY - (toY - fromY) * scale)
    );
    scale = 1;
    if (otherToY < 0) {
      scale = fromY / /*(float) */
      (fromY - otherToY);
      otherToY = 0;
    } else if (otherToY >= this.image.getHeight()) {
      scale = (this.image.getHeight() - 1 - fromY) / /*(float) */
      (otherToY - fromY);
      otherToY = this.image.getHeight() - 1;
    }
    otherToX = /*(int) */
    Math.floor(fromX + (otherToX - fromX) * scale);
    result += this.sizeOfBlackWhiteBlackRun(fromX, fromY, otherToX, otherToY);
    return result - 1;
  }
  /**
   * <p>This method traces a line from a point in the image, in the direction towards another point.
   * It begins in a black region, and keeps going until it finds white, then black, then white again.
   * It reports the distance from the start to this point.</p>
   *
   * <p>This is used when figuring out how wide a finder pattern is, when the finder pattern
   * may be skewed or rotated.</p>
   */
  sizeOfBlackWhiteBlackRun(fromX, fromY, toX, toY) {
    const steep = Math.abs(toY - fromY) > Math.abs(toX - fromX);
    if (steep) {
      let temp = fromX;
      fromX = fromY;
      fromY = temp;
      temp = toX;
      toX = toY;
      toY = temp;
    }
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    let error = -dx / 2;
    const xstep = fromX < toX ? 1 : -1;
    const ystep = fromY < toY ? 1 : -1;
    let state = 0;
    const xLimit = toX + xstep;
    for (let x = fromX, y = fromY; x !== xLimit; x += xstep) {
      const realX = steep ? y : x;
      const realY = steep ? x : y;
      if (state === 1 === this.image.get(realX, realY)) {
        if (state === 2) {
          return MathUtils.distance(x, y, fromX, fromY);
        }
        state++;
      }
      error += dy;
      if (error > 0) {
        if (y === toY) {
          break;
        }
        y += ystep;
        error -= dx;
      }
    }
    if (state === 2) {
      return MathUtils.distance(toX + xstep, toY, fromX, fromY);
    }
    return NaN;
  }
  /**
   * <p>Attempts to locate an alignment pattern in a limited region of the image, which is
   * guessed to contain it. This method uses {@link AlignmentPattern}.</p>
   *
   * @param overallEstModuleSize estimated module size so far
   * @param estAlignmentX x coordinate of center of area probably containing alignment pattern
   * @param estAlignmentY y coordinate of above
   * @param allowanceFactor number of pixels in all directions to search from the center
   * @return {@link AlignmentPattern} if found, or null otherwise
   * @throws NotFoundException if an unexpected error occurs during detection
   */
  findAlignmentInRegion(overallEstModuleSize, estAlignmentX, estAlignmentY, allowanceFactor) {
    const allowance = (
      /*(int) */
      Math.floor(allowanceFactor * overallEstModuleSize)
    );
    const alignmentAreaLeftX = Math.max(0, estAlignmentX - allowance);
    const alignmentAreaRightX = Math.min(this.image.getWidth() - 1, estAlignmentX + allowance);
    if (alignmentAreaRightX - alignmentAreaLeftX < overallEstModuleSize * 3) {
      throw new NotFoundException("Alignment top exceeds estimated module size.");
    }
    const alignmentAreaTopY = Math.max(0, estAlignmentY - allowance);
    const alignmentAreaBottomY = Math.min(this.image.getHeight() - 1, estAlignmentY + allowance);
    if (alignmentAreaBottomY - alignmentAreaTopY < overallEstModuleSize * 3) {
      throw new NotFoundException("Alignment bottom exceeds estimated module size.");
    }
    const alignmentFinder = new AlignmentPatternFinder(
      this.image,
      alignmentAreaLeftX,
      alignmentAreaTopY,
      alignmentAreaRightX - alignmentAreaLeftX,
      alignmentAreaBottomY - alignmentAreaTopY,
      overallEstModuleSize,
      this.resultPointCallback
    );
    return alignmentFinder.find();
  }
}

export { Detector };
//# sourceMappingURL=Detector.js.map
//# sourceMappingURL=Detector.js.map