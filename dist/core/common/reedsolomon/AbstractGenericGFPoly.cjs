'use strict';

var AbstractGenericGF = require('./AbstractGenericGF');

class AbstractGenericGFPoly {
  field;
  coefficients;
  getCoefficients() {
    return this.coefficients;
  }
  /**
   * @return degree of this polynomial
   */
  getDegree() {
    return this.coefficients.length - 1;
  }
  /**
   * @return true iff this polynomial is the monomial "0"
   */
  isZero() {
    return this.coefficients[0] === 0;
  }
  /**
   * @return coefficient of x^degree term in this polynomial
   */
  getCoefficient(degree) {
    return this.coefficients[this.coefficients.length - 1 - degree];
  }
  /**
   * @return evaluation of this polynomial at a given point
   */
  evaluateAt(a) {
    if (a === 0) {
      return this.getCoefficient(0);
    }
    const coefficients = this.coefficients;
    let result;
    if (a === 1) {
      result = 0;
      for (let i = 0, length = coefficients.length; i !== length; i++) {
        const coefficient = coefficients[i];
        result = AbstractGenericGF.AbstractGenericGF.addOrSubtract(result, coefficient);
      }
      return result;
    }
    result = coefficients[0];
    const size = coefficients.length;
    const field = this.field;
    for (let i = 1; i < size; i++) {
      result = AbstractGenericGF.AbstractGenericGF.addOrSubtract(field.multiply(a, result), coefficients[i]);
    }
    return result;
  }
  /*@Override*/
  toString() {
    let result = "";
    for (let degree = this.getDegree(); degree >= 0; degree--) {
      let coefficient = this.getCoefficient(degree);
      if (coefficient !== 0) {
        if (coefficient < 0) {
          result += " - ";
          coefficient = -coefficient;
        } else {
          if (result.length > 0) {
            result += " + ";
          }
        }
        if (degree === 0 || coefficient !== 1) {
          const alphaPower = this.field.log(coefficient);
          if (alphaPower === 0) {
            result += "1";
          } else if (alphaPower === 1) {
            result += "a";
          } else {
            result += "a^";
            result += alphaPower;
          }
        }
        if (degree !== 0) {
          if (degree === 1) {
            result += "x";
          } else {
            result += "x^";
            result += degree;
          }
        }
      }
    }
    return result;
  }
}

exports.AbstractGenericGFPoly = AbstractGenericGFPoly;
//# sourceMappingURL=AbstractGenericGFPoly.cjs.map
//# sourceMappingURL=AbstractGenericGFPoly.cjs.map