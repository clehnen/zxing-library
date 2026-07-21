import { IllegalArgumentException } from '../../IllegalArgumentException';

class QRCodeMaskUtil {
  // Penalty weights from section 6.8.2.1
  static N1 = 3;
  static N2 = 3;
  static N3 = 40;
  static N4 = 10;
  constructor() {
  }
  /**
   * Apply mask penalty rule 1 and return the penalty. Find repetitive cells with the same color and
   * give penalty to them. Example: 00000 or 11111.
   */
  static applyMaskPenaltyRule1(matrix) {
    return QRCodeMaskUtil.applyMaskPenaltyRule1Internal(matrix, true) + QRCodeMaskUtil.applyMaskPenaltyRule1Internal(matrix, false);
  }
  /**
   * Apply mask penalty rule 2 and return the penalty. Find 2x2 blocks with the same color and give
   * penalty to them. This is actually equivalent to the spec's rule, which is to find MxN blocks and give a
   * penalty proportional to (M-1)x(N-1), because this is the number of 2x2 blocks inside such a block.
   */
  static applyMaskPenaltyRule2(matrix) {
    let penalty = 0;
    const array = matrix.getArray();
    const width = matrix.getWidth();
    const height = matrix.getHeight();
    for (let y = 0; y < height - 1; y++) {
      const arrayY = array[y];
      for (let x = 0; x < width - 1; x++) {
        const value = arrayY[x];
        if (value === arrayY[x + 1] && value === array[y + 1][x] && value === array[y + 1][x + 1]) {
          penalty++;
        }
      }
    }
    return QRCodeMaskUtil.N2 * penalty;
  }
  /**
   * Apply mask penalty rule 3 and return the penalty. Find consecutive runs of 1:1:3:1:1:4
   * starting with black, or 4:1:1:3:1:1 starting with white, and give penalty to them.  If we
   * find patterns like 000010111010000, we give penalty once.
   */
  static applyMaskPenaltyRule3(matrix) {
    let numPenalties = 0;
    const array = matrix.getArray();
    const width = matrix.getWidth();
    const height = matrix.getHeight();
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const arrayY = array[y];
        if (x + 6 < width && arrayY[x] === 1 && arrayY[x + 1] === 0 && arrayY[x + 2] === 1 && arrayY[x + 3] === 1 && arrayY[x + 4] === 1 && arrayY[x + 5] === 0 && arrayY[x + 6] === 1 && (QRCodeMaskUtil.isWhiteHorizontal(arrayY, x - 4, x) || QRCodeMaskUtil.isWhiteHorizontal(arrayY, x + 7, x + 11))) {
          numPenalties++;
        }
        if (y + 6 < height && array[y][x] === 1 && array[y + 1][x] === 0 && array[y + 2][x] === 1 && array[y + 3][x] === 1 && array[y + 4][x] === 1 && array[y + 5][x] === 0 && array[y + 6][x] === 1 && (QRCodeMaskUtil.isWhiteVertical(array, x, y - 4, y) || QRCodeMaskUtil.isWhiteVertical(array, x, y + 7, y + 11))) {
          numPenalties++;
        }
      }
    }
    return numPenalties * QRCodeMaskUtil.N3;
  }
  static isWhiteHorizontal(rowArray, from, to) {
    from = Math.max(from, 0);
    to = Math.min(to, rowArray.length);
    for (let i = from; i < to; i++) {
      if (rowArray[i] === 1) {
        return false;
      }
    }
    return true;
  }
  static isWhiteVertical(array, col, from, to) {
    from = Math.max(from, 0);
    to = Math.min(to, array.length);
    for (let i = from; i < to; i++) {
      if (array[i][col] === 1) {
        return false;
      }
    }
    return true;
  }
  /**
   * Apply mask penalty rule 4 and return the penalty. Calculate the ratio of dark cells and give
   * penalty if the ratio is far from 50%. It gives 10 penalty for 5% distance.
   */
  static applyMaskPenaltyRule4(matrix) {
    let numDarkCells = 0;
    const array = matrix.getArray();
    const width = matrix.getWidth();
    const height = matrix.getHeight();
    for (let y = 0; y < height; y++) {
      const arrayY = array[y];
      for (let x = 0; x < width; x++) {
        if (arrayY[x] === 1) {
          numDarkCells++;
        }
      }
    }
    const numTotalCells = matrix.getHeight() * matrix.getWidth();
    const fivePercentVariances = Math.floor(Math.abs(numDarkCells * 2 - numTotalCells) * 10 / numTotalCells);
    return fivePercentVariances * QRCodeMaskUtil.N4;
  }
  /**
   * Return the mask bit for "getMaskPattern" at "x" and "y". See 8.8 of JISX0510:2004 for mask
   * pattern conditions.
   */
  static getDataMaskBit(maskPattern, x, y) {
    let intermediate;
    let temp;
    switch (maskPattern) {
      case 0:
        intermediate = y + x & 1;
        break;
      case 1:
        intermediate = y & 1;
        break;
      case 2:
        intermediate = x % 3;
        break;
      case 3:
        intermediate = (y + x) % 3;
        break;
      case 4:
        intermediate = Math.floor(y / 2) + Math.floor(x / 3) & 1;
        break;
      case 5:
        temp = y * x;
        intermediate = (temp & 1) + temp % 3;
        break;
      case 6:
        temp = y * x;
        intermediate = (temp & 1) + temp % 3 & 1;
        break;
      case 7:
        temp = y * x;
        intermediate = temp % 3 + (y + x & 1) & 1;
        break;
      default:
        throw new IllegalArgumentException("Invalid mask pattern: " + maskPattern);
    }
    return intermediate === 0;
  }
  /**
   * Helper function for applyMaskPenaltyRule1. We need this for doing this calculation in both
   * vertical and horizontal orders respectively.
   */
  static applyMaskPenaltyRule1Internal(matrix, isHorizontal) {
    let penalty = 0;
    const iLimit = isHorizontal ? matrix.getHeight() : matrix.getWidth();
    const jLimit = isHorizontal ? matrix.getWidth() : matrix.getHeight();
    const array = matrix.getArray();
    for (let i = 0; i < iLimit; i++) {
      let numSameBitCells = 0;
      let prevBit = -1;
      for (let j = 0; j < jLimit; j++) {
        const bit = isHorizontal ? array[i][j] : array[j][i];
        if (bit === prevBit) {
          numSameBitCells++;
        } else {
          if (numSameBitCells >= 5) {
            penalty += QRCodeMaskUtil.N1 + (numSameBitCells - 5);
          }
          numSameBitCells = 1;
          prevBit = bit;
        }
      }
      if (numSameBitCells >= 5) {
        penalty += QRCodeMaskUtil.N1 + (numSameBitCells - 5);
      }
    }
    return penalty;
  }
}

export { QRCodeMaskUtil };
//# sourceMappingURL=QRCodeMaskUtil.js.map
//# sourceMappingURL=QRCodeMaskUtil.js.map