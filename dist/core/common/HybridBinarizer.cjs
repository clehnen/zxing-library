'use strict';

var GlobalHistogramBinarizer = require('./GlobalHistogramBinarizer');
var BitMatrix = require('./BitMatrix');

class HybridBinarizer extends GlobalHistogramBinarizer.GlobalHistogramBinarizer {
  // This class uses 5x5 blocks to compute local luminance, where each block is 8x8 pixels.
  // So this is the smallest dimension in each axis we can accept.
  static BLOCK_SIZE_POWER = 3;
  static BLOCK_SIZE = 1 << HybridBinarizer.BLOCK_SIZE_POWER;
  // ...0100...00
  static BLOCK_SIZE_MASK = HybridBinarizer.BLOCK_SIZE - 1;
  // ...0011...11
  static MINIMUM_DIMENSION = HybridBinarizer.BLOCK_SIZE * 5;
  static MIN_DYNAMIC_RANGE = 24;
  matrix = null;
  constructor(source) {
    super(source);
  }
  /**
   * Calculates the final BitMatrix once for all requests. This could be called once from the
   * constructor instead, but there are some advantages to doing it lazily, such as making
   * profiling easier, and not doing heavy lifting when callers don't expect it.
   */
  /*@Override*/
  getBlackMatrix() {
    if (this.matrix !== null) {
      return this.matrix;
    }
    const source = this.getLuminanceSource();
    const width = source.getWidth();
    const height = source.getHeight();
    if (width >= HybridBinarizer.MINIMUM_DIMENSION && height >= HybridBinarizer.MINIMUM_DIMENSION) {
      const luminances = source.getMatrix();
      let subWidth = width >> HybridBinarizer.BLOCK_SIZE_POWER;
      if ((width & HybridBinarizer.BLOCK_SIZE_MASK) !== 0) {
        subWidth++;
      }
      let subHeight = height >> HybridBinarizer.BLOCK_SIZE_POWER;
      if ((height & HybridBinarizer.BLOCK_SIZE_MASK) !== 0) {
        subHeight++;
      }
      const blackPoints = HybridBinarizer.calculateBlackPoints(luminances, subWidth, subHeight, width, height);
      const newMatrix = new BitMatrix.BitMatrix(width, height);
      HybridBinarizer.calculateThresholdForBlock(luminances, subWidth, subHeight, width, height, blackPoints, newMatrix);
      this.matrix = newMatrix;
    } else {
      this.matrix = super.getBlackMatrix();
    }
    return this.matrix;
  }
  /*@Override*/
  createBinarizer(source) {
    return new HybridBinarizer(source);
  }
  /**
   * For each block in the image, calculate the average black point using a 5x5 grid
   * of the blocks around it. Also handles the corner cases (fractional blocks are computed based
   * on the last pixels in the row/column which are also used in the previous block).
   */
  static calculateThresholdForBlock(luminances, subWidth, subHeight, width, height, blackPoints, matrix) {
    const maxYOffset = height - HybridBinarizer.BLOCK_SIZE;
    const maxXOffset = width - HybridBinarizer.BLOCK_SIZE;
    for (let y = 0; y < subHeight; y++) {
      let yoffset = y << HybridBinarizer.BLOCK_SIZE_POWER;
      if (yoffset > maxYOffset) {
        yoffset = maxYOffset;
      }
      const top = HybridBinarizer.cap(y, 2, subHeight - 3);
      for (let x = 0; x < subWidth; x++) {
        let xoffset = x << HybridBinarizer.BLOCK_SIZE_POWER;
        if (xoffset > maxXOffset) {
          xoffset = maxXOffset;
        }
        const left = HybridBinarizer.cap(x, 2, subWidth - 3);
        let sum = 0;
        for (let z = -2; z <= 2; z++) {
          const blackRow = blackPoints[top + z];
          sum += blackRow[left - 2] + blackRow[left - 1] + blackRow[left] + blackRow[left + 1] + blackRow[left + 2];
        }
        const average = sum / 25;
        HybridBinarizer.thresholdBlock(luminances, xoffset, yoffset, average, width, matrix);
      }
    }
  }
  static cap(value, min, max) {
    return value < min ? min : value > max ? max : value;
  }
  /**
   * Applies a single threshold to a block of pixels.
   */
  static thresholdBlock(luminances, xoffset, yoffset, threshold, stride, matrix) {
    for (let y = 0, offset = yoffset * stride + xoffset; y < HybridBinarizer.BLOCK_SIZE; y++, offset += stride) {
      for (let x = 0; x < HybridBinarizer.BLOCK_SIZE; x++) {
        if ((luminances[offset + x] & 255) <= threshold) {
          matrix.set(xoffset + x, yoffset + y);
        }
      }
    }
  }
  /**
   * Calculates a single black point for each block of pixels and saves it away.
   * See the following thread for a discussion of this algorithm:
   *  http://groups.google.com/group/zxing/browse_thread/thread/d06efa2c35a7ddc0
   */
  static calculateBlackPoints(luminances, subWidth, subHeight, width, height) {
    const maxYOffset = height - HybridBinarizer.BLOCK_SIZE;
    const maxXOffset = width - HybridBinarizer.BLOCK_SIZE;
    const blackPoints = new Array(subHeight);
    for (let y = 0; y < subHeight; y++) {
      blackPoints[y] = new Int32Array(subWidth);
      let yoffset = y << HybridBinarizer.BLOCK_SIZE_POWER;
      if (yoffset > maxYOffset) {
        yoffset = maxYOffset;
      }
      for (let x = 0; x < subWidth; x++) {
        let xoffset = x << HybridBinarizer.BLOCK_SIZE_POWER;
        if (xoffset > maxXOffset) {
          xoffset = maxXOffset;
        }
        let sum = 0;
        let min = 255;
        let max = 0;
        for (let yy = 0, offset = yoffset * width + xoffset; yy < HybridBinarizer.BLOCK_SIZE; yy++, offset += width) {
          for (let xx = 0; xx < HybridBinarizer.BLOCK_SIZE; xx++) {
            const pixel = luminances[offset + xx] & 255;
            sum += pixel;
            if (pixel < min) {
              min = pixel;
            }
            if (pixel > max) {
              max = pixel;
            }
          }
          if (max - min > HybridBinarizer.MIN_DYNAMIC_RANGE) {
            for (yy++, offset += width; yy < HybridBinarizer.BLOCK_SIZE; yy++, offset += width) {
              for (let xx = 0; xx < HybridBinarizer.BLOCK_SIZE; xx++) {
                sum += luminances[offset + xx] & 255;
              }
            }
          }
        }
        let average = sum >> HybridBinarizer.BLOCK_SIZE_POWER * 2;
        if (max - min <= HybridBinarizer.MIN_DYNAMIC_RANGE) {
          average = min / 2;
          if (y > 0 && x > 0) {
            const averageNeighborBlackPoint = (blackPoints[y - 1][x] + 2 * blackPoints[y][x - 1] + blackPoints[y - 1][x - 1]) / 4;
            if (min < averageNeighborBlackPoint) {
              average = averageNeighborBlackPoint;
            }
          }
        }
        blackPoints[y][x] = average;
      }
    }
    return blackPoints;
  }
}

exports.HybridBinarizer = HybridBinarizer;
//# sourceMappingURL=HybridBinarizer.cjs.map
//# sourceMappingURL=HybridBinarizer.cjs.map