class MathUtils {
  constructor() {
  }
  /**
   * Ends up being a bit faster than {@link Math#round(float)}. This merely rounds its
   * argument to the nearest int, where x.5 rounds up to x+1. Semantics of this shortcut
   * differ slightly from {@link Math#round(float)} in that half rounds down for negative
   * values. -2.5 rounds to -3, not -2. For purposes here it makes no difference.
   *
   * @param d real value to round
   * @return nearest {@code int}
   */
  static round(d) {
    if (isNaN(d)) return 0;
    if (d <= Number.MIN_SAFE_INTEGER) return Number.MIN_SAFE_INTEGER;
    if (d >= Number.MAX_SAFE_INTEGER) return Number.MAX_SAFE_INTEGER;
    return (
      /*(int) */
      d + (d < 0 ? -0.5 : 0.5) | 0
    );
  }
  // TYPESCRIPTPORT: maybe remove round method and call directly Math.round, it looks like it doesn't make sense for js
  /**
   * @param aX point A x coordinate
   * @param aY point A y coordinate
   * @param bX point B x coordinate
   * @param bY point B y coordinate
   * @return Euclidean distance between points A and B
   */
  static distance(aX, aY, bX, bY) {
    const xDiff = aX - bX;
    const yDiff = aY - bY;
    return (
      /*(float) */
      Math.sqrt(xDiff * xDiff + yDiff * yDiff)
    );
  }
  /**
   * @param aX point A x coordinate
   * @param aY point A y coordinate
   * @param bX point B x coordinate
   * @param bY point B y coordinate
   * @return Euclidean distance between points A and B
   */
  // public static distance(aX: number /*int*/, aY: number /*int*/, bX: number /*int*/, bY: number /*int*/): float {
  //   const xDiff = aX - bX
  //   const yDiff = aY - bY
  //   return (float) Math.sqrt(xDiff * xDiff + yDiff * yDiff);
  // }
  /**
   * @param array values to sum
   * @return sum of values in array
   */
  static sum(array) {
    let count = 0;
    for (let i = 0, length = array.length; i !== length; i++) {
      const a = array[i];
      count += a;
    }
    return count;
  }
}

export { MathUtils };
//# sourceMappingURL=MathUtils.js.map
//# sourceMappingURL=MathUtils.js.map