'use strict';

var Binarizer = require('../Binarizer');
var BitArray = require('./BitArray');
var BitMatrix = require('./BitMatrix');
var NotFoundException = require('../NotFoundException');

class GlobalHistogramBinarizer extends Binarizer.Binarizer {
  static LUMINANCE_BITS = 5;
  static LUMINANCE_SHIFT = 8 - GlobalHistogramBinarizer.LUMINANCE_BITS;
  static LUMINANCE_BUCKETS = 1 << GlobalHistogramBinarizer.LUMINANCE_BITS;
  static EMPTY = Uint8ClampedArray.from([0]);
  luminances;
  buckets;
  constructor(source) {
    super(source);
    this.luminances = GlobalHistogramBinarizer.EMPTY;
    this.buckets = new Int32Array(GlobalHistogramBinarizer.LUMINANCE_BUCKETS);
  }
  // Applies simple sharpening to the row data to improve performance of the 1D Readers.
  /*@Override*/
  getBlackRow(y, row) {
    const source = this.getLuminanceSource();
    const width = source.getWidth();
    if (row === void 0 || row === null || row.getSize() < width) {
      row = new BitArray.BitArray(width);
    } else {
      row.clear();
    }
    this.initArrays(width);
    const localLuminances = source.getRow(y, this.luminances);
    const localBuckets = this.buckets;
    for (let x = 0; x < width; x++) {
      localBuckets[(localLuminances[x] & 255) >> GlobalHistogramBinarizer.LUMINANCE_SHIFT]++;
    }
    const blackPoint = GlobalHistogramBinarizer.estimateBlackPoint(localBuckets);
    if (width < 3) {
      for (let x = 0; x < width; x++) {
        if ((localLuminances[x] & 255) < blackPoint) {
          row.set(x);
        }
      }
    } else {
      let left = localLuminances[0] & 255;
      let center = localLuminances[1] & 255;
      for (let x = 1; x < width - 1; x++) {
        const right = localLuminances[x + 1] & 255;
        if ((center * 4 - left - right) / 2 < blackPoint) {
          row.set(x);
        }
        left = center;
        center = right;
      }
    }
    return row;
  }
  // Does not sharpen the data, as this call is intended to only be used by 2D Readers.
  /*@Override*/
  getBlackMatrix() {
    const source = this.getLuminanceSource();
    const width = source.getWidth();
    const height = source.getHeight();
    const matrix = new BitMatrix.BitMatrix(width, height);
    this.initArrays(width);
    const localBuckets = this.buckets;
    for (let y = 1; y < 5; y++) {
      const row = Math.floor(height * y / 5);
      const localLuminances2 = source.getRow(row, this.luminances);
      const right = Math.floor(width * 4 / 5);
      for (let x = Math.floor(width / 5); x < right; x++) {
        const pixel = localLuminances2[x] & 255;
        localBuckets[pixel >> GlobalHistogramBinarizer.LUMINANCE_SHIFT]++;
      }
    }
    const blackPoint = GlobalHistogramBinarizer.estimateBlackPoint(localBuckets);
    const localLuminances = source.getMatrix();
    for (let y = 0; y < height; y++) {
      const offset = y * width;
      for (let x = 0; x < width; x++) {
        const pixel = localLuminances[offset + x] & 255;
        if (pixel < blackPoint) {
          matrix.set(x, y);
        }
      }
    }
    return matrix;
  }
  /*@Override*/
  createBinarizer(source) {
    return new GlobalHistogramBinarizer(source);
  }
  initArrays(luminanceSize) {
    if (this.luminances.length < luminanceSize) {
      this.luminances = new Uint8ClampedArray(luminanceSize);
    }
    this.buckets.fill(0);
  }
  static estimateBlackPoint(buckets) {
    const numBuckets = buckets.length;
    let maxBucketCount = 0;
    let firstPeak = 0;
    let firstPeakSize = 0;
    for (let x = 0; x < numBuckets; x++) {
      if (buckets[x] > firstPeakSize) {
        firstPeak = x;
        firstPeakSize = buckets[x];
      }
      if (buckets[x] > maxBucketCount) {
        maxBucketCount = buckets[x];
      }
    }
    let secondPeak = 0;
    let secondPeakScore = 0;
    for (let x = 0; x < numBuckets; x++) {
      const distanceToBiggest = x - firstPeak;
      const score = buckets[x] * distanceToBiggest * distanceToBiggest;
      if (score > secondPeakScore) {
        secondPeak = x;
        secondPeakScore = score;
      }
    }
    if (firstPeak > secondPeak) {
      const temp = firstPeak;
      firstPeak = secondPeak;
      secondPeak = temp;
    }
    if (secondPeak - firstPeak <= numBuckets / 16) {
      throw new NotFoundException.NotFoundException();
    }
    let bestValley = secondPeak - 1;
    let bestValleyScore = -1;
    for (let x = secondPeak - 1; x > firstPeak; x--) {
      const fromFirst = x - firstPeak;
      const score = fromFirst * fromFirst * (secondPeak - x) * (maxBucketCount - buckets[x]);
      if (score > bestValleyScore) {
        bestValley = x;
        bestValleyScore = score;
      }
    }
    return bestValley << GlobalHistogramBinarizer.LUMINANCE_SHIFT;
  }
}

exports.GlobalHistogramBinarizer = GlobalHistogramBinarizer;
//# sourceMappingURL=GlobalHistogramBinarizer.cjs.map
//# sourceMappingURL=GlobalHistogramBinarizer.cjs.map