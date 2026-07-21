class Formatter {
  /**
   * The internal formatted value.
   */
  buffer;
  constructor() {
    this.buffer = "";
  }
  /**
   *
   * @see https://stackoverflow.com/a/13439711/4367683
   *
   * @param str
   * @param arr
   */
  static form(str, arr) {
    let i = -1;
    function callback(exp, p0, p1, p2, p3, p4) {
      if (exp === "%%") return "%";
      if (arr[++i] === void 0) return void 0;
      exp = p2 ? parseInt(p2.substr(1)) : void 0;
      let base = p3 ? parseInt(p3.substr(1)) : void 0;
      let val;
      switch (p4) {
        case "s":
          val = arr[i];
          break;
        case "c":
          val = arr[i][0];
          break;
        case "f":
          val = parseFloat(arr[i]).toFixed(exp);
          break;
        case "p":
          val = parseFloat(arr[i]).toPrecision(exp);
          break;
        case "e":
          val = parseFloat(arr[i]).toExponential(exp);
          break;
        case "x":
          val = parseInt(arr[i]).toString(base ? base : 16);
          break;
        case "d":
          val = parseFloat(parseInt(arr[i], base ? base : 10).toPrecision(exp)).toFixed(0);
          break;
      }
      val = typeof val === "object" ? JSON.stringify(val) : (+val).toString(base);
      let size = parseInt(p1);
      let ch = p1 && p1[0] + "" === "0" ? "0" : " ";
      while (val.length < size) val = p0 !== void 0 ? val + ch : ch + val;
      return val;
    }
    let regex = /%(-)?(0?[0-9]+)?([.][0-9]+)?([#][0-9]+)?([scfpexd%])/g;
    return str.replace(regex, callback);
  }
  /**
   *
   * @param append The new string to append.
   * @param args Argumets values to be formated.
   */
  format(append, ...args) {
    this.buffer += Formatter.form(append, args);
  }
  /**
   * Returns the Formatter string value.
   */
  toString() {
    return this.buffer;
  }
}

export { Formatter };
//# sourceMappingURL=Formatter.js.map
//# sourceMappingURL=Formatter.js.map