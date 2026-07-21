'use strict';

var BitArray = require('../common/BitArray');
var DecodeHintType = require('../DecodeHintType');
var ResultMetadataType = require('../ResultMetadataType');
var ResultPoint = require('../ResultPoint');
var NotFoundException = require('../NotFoundException');

class OneDReader {
  /*
  @Override
  public Result decode(BinaryBitmap image) throws NotFoundException, FormatException {
    return decode(image, null);
  }
  */
  // Note that we don't try rotation without the try harder flag, even if rotation was supported.
  // @Override
  decode(image, hints) {
    try {
      return this.doDecode(image, hints);
    } catch (nfe) {
      const tryHarder = hints && hints.get(DecodeHintType.DecodeHintType.TRY_HARDER) === true;
      if (tryHarder && image.isRotateSupported()) {
        const rotatedImage = image.rotateCounterClockwise();
        const result = this.doDecode(rotatedImage, hints);
        const metadata = result.getResultMetadata();
        let orientation = 270;
        if (metadata !== null && metadata.get(ResultMetadataType.ResultMetadataType.ORIENTATION) === true) {
          orientation = orientation + metadata.get(ResultMetadataType.ResultMetadataType.ORIENTATION) % 360;
        }
        result.putMetadata(ResultMetadataType.ResultMetadataType.ORIENTATION, orientation);
        const points = result.getResultPoints();
        if (points !== null) {
          const height = rotatedImage.getHeight();
          for (let i = 0; i < points.length; i++) {
            points[i] = new ResultPoint.ResultPoint(height - points[i].getY() - 1, points[i].getX());
          }
        }
        return result;
      } else {
        throw new NotFoundException.NotFoundException();
      }
    }
  }
  // @Override
  reset() {
  }
  /**
   * We're going to examine rows from the middle outward, searching alternately above and below the
   * middle, and farther out each time. rowStep is the number of rows between each successive
   * attempt above and below the middle. So we'd scan row middle, then middle - rowStep, then
   * middle + rowStep, then middle - (2 * rowStep), etc.
   * rowStep is bigger as the image is taller, but is always at least 1. We've somewhat arbitrarily
   * decided that moving up and down by about 1/16 of the image is pretty good; we try more of the
   * image if "trying harder".
   *
   * @param image The image to decode
   * @param hints Any hints that were requested
   * @return The contents of the decoded barcode
   * @throws NotFoundException Any spontaneous errors which occur
   */
  doDecode(image, hints) {
    const width = image.getWidth();
    const height = image.getHeight();
    let row = new BitArray.BitArray(width);
    const tryHarder = hints && hints.get(DecodeHintType.DecodeHintType.TRY_HARDER) === true;
    const rowStep = Math.max(1, height >> (tryHarder ? 8 : 5));
    let maxLines;
    if (tryHarder) {
      maxLines = height;
    } else {
      maxLines = 25;
    }
    const middle = Math.trunc(height / 2);
    for (let x = 0; x < maxLines; x++) {
      const rowStepsAboveOrBelow = Math.trunc((x + 1) / 2);
      const isAbove = (x & 1) === 0;
      const rowNumber = middle + rowStep * (isAbove ? rowStepsAboveOrBelow : -rowStepsAboveOrBelow);
      if (rowNumber < 0 || rowNumber >= height) {
        break;
      }
      try {
        row = image.getBlackRow(rowNumber, row);
      } catch (ignored) {
        continue;
      }
      for (let attempt = 0; attempt < 2; attempt++) {
        if (attempt === 1) {
          row.reverse();
          if (hints && hints.get(DecodeHintType.DecodeHintType.NEED_RESULT_POINT_CALLBACK) === true) {
            const newHints = /* @__PURE__ */ new Map();
            hints.forEach((hint, key) => newHints.set(key, hint));
            newHints.delete(DecodeHintType.DecodeHintType.NEED_RESULT_POINT_CALLBACK);
            hints = newHints;
          }
        }
        try {
          const result = this.decodeRow(rowNumber, row, hints);
          if (attempt === 1) {
            result.putMetadata(ResultMetadataType.ResultMetadataType.ORIENTATION, 180);
            const points = result.getResultPoints();
            if (points !== null) {
              points[0] = new ResultPoint.ResultPoint(width - points[0].getX() - 1, points[0].getY());
              points[1] = new ResultPoint.ResultPoint(width - points[1].getX() - 1, points[1].getY());
            }
          }
          return result;
        } catch (re) {
        }
      }
    }
    throw new NotFoundException.NotFoundException();
  }
  /**
   * Records the size of successive runs of white and black pixels in a row, starting at a given point.
   * The values are recorded in the given array, and the number of runs recorded is equal to the size
   * of the array. If the row starts on a white pixel at the given start point, then the first count
   * recorded is the run of white pixels starting from that point; likewise it is the count of a run
   * of black pixels if the row begin on a black pixels at that point.
   *
   * @param row row to count from
   * @param start offset into row to start at
   * @param counters array into which to record counts
   * @throws NotFoundException if counters cannot be filled entirely from row before running out
   *  of pixels
   */
  static recordPattern(row, start, counters) {
    const numCounters = counters.length;
    for (let index = 0; index < numCounters; index++)
      counters[index] = 0;
    const end = row.getSize();
    if (start >= end) {
      throw new NotFoundException.NotFoundException();
    }
    let isWhite = !row.get(start);
    let counterPosition = 0;
    let i = start;
    while (i < end) {
      if (row.get(i) !== isWhite) {
        counters[counterPosition]++;
      } else {
        if (++counterPosition === numCounters) {
          break;
        } else {
          counters[counterPosition] = 1;
          isWhite = !isWhite;
        }
      }
      i++;
    }
    if (!(counterPosition === numCounters || counterPosition === numCounters - 1 && i === end)) {
      throw new NotFoundException.NotFoundException();
    }
  }
  static recordPatternInReverse(row, start, counters) {
    let numTransitionsLeft = counters.length;
    let last = row.get(start);
    while (start > 0 && numTransitionsLeft >= 0) {
      if (row.get(--start) !== last) {
        numTransitionsLeft--;
        last = !last;
      }
    }
    if (numTransitionsLeft >= 0) {
      throw new NotFoundException.NotFoundException();
    }
    OneDReader.recordPattern(row, start + 1, counters);
  }
  /**
   * Determines how closely a set of observed counts of runs of black/white values matches a given
   * target pattern. This is reported as the ratio of the total variance from the expected pattern
   * proportions across all pattern elements, to the length of the pattern.
   *
   * @param counters observed counters
   * @param pattern expected pattern
   * @param maxIndividualVariance The most any counter can differ before we give up
   * @return ratio of total variance between counters and pattern compared to total pattern size
   */
  static patternMatchVariance(counters, pattern, maxIndividualVariance) {
    const numCounters = counters.length;
    let total = 0;
    let patternLength = 0;
    for (let i = 0; i < numCounters; i++) {
      total += counters[i];
      patternLength += pattern[i];
    }
    if (total < patternLength) {
      return Number.POSITIVE_INFINITY;
    }
    const unitBarWidth = total / patternLength;
    maxIndividualVariance *= unitBarWidth;
    let totalVariance = 0;
    for (let x = 0; x < numCounters; x++) {
      const counter = counters[x];
      const scaledPattern = pattern[x] * unitBarWidth;
      const variance = counter > scaledPattern ? counter - scaledPattern : scaledPattern - counter;
      if (variance > maxIndividualVariance) {
        return Number.POSITIVE_INFINITY;
      }
      totalVariance += variance;
    }
    return totalVariance / total;
  }
}

exports.OneDReader = OneDReader;
//# sourceMappingURL=OneDReader.cjs.map
//# sourceMappingURL=OneDReader.cjs.map