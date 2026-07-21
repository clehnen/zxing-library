import { ZXingSystem } from './util/ZXingSystem';

class Result {
  // public constructor(private text: string,
  //               Uint8Array rawBytes,
  //               ResultPoconst resultPoints: Int32Array,
  //               BarcodeFormat format) {
  //   this(text, rawBytes, resultPoints, format, System.currentTimeMillis())
  // }
  // public constructor(text: string,
  //               Uint8Array rawBytes,
  //               ResultPoconst resultPoints: Int32Array,
  //               BarcodeFormat format,
  //               long timestamp) {
  //   this(text, rawBytes, rawBytes == null ? 0 : 8 * rawBytes.length,
  //        resultPoints, format, timestamp)
  // }
  constructor(text, rawBytes, numBits = rawBytes == null ? 0 : 8 * rawBytes.length, resultPoints, format, timestamp = ZXingSystem.currentTimeMillis()) {
    this.text = text;
    this.rawBytes = rawBytes;
    this.numBits = numBits;
    this.resultPoints = resultPoints;
    this.format = format;
    this.timestamp = timestamp;
    this.text = text;
    this.rawBytes = rawBytes;
    if (void 0 === numBits || null === numBits) {
      this.numBits = rawBytes === null || rawBytes === void 0 ? 0 : 8 * rawBytes.length;
    } else {
      this.numBits = numBits;
    }
    this.resultPoints = resultPoints;
    this.format = format;
    this.resultMetadata = null;
    if (void 0 === timestamp || null === timestamp) {
      this.timestamp = ZXingSystem.currentTimeMillis();
    } else {
      this.timestamp = timestamp;
    }
  }
  text;
  rawBytes;
  numBits;
  resultPoints;
  format;
  timestamp;
  resultMetadata;
  /**
   * @return raw text encoded by the barcode
   */
  getText() {
    return this.text;
  }
  /**
   * @return raw bytes encoded by the barcode, if applicable, otherwise {@code null}
   */
  getRawBytes() {
    return this.rawBytes;
  }
  /**
   * @return how many bits of {@link #getRawBytes()} are valid; typically 8 times its length
   * @since 3.3.0
   */
  getNumBits() {
    return this.numBits;
  }
  /**
   * @return points related to the barcode in the image. These are typically points
   *         identifying finder patterns or the corners of the barcode. The exact meaning is
   *         specific to the type of barcode that was decoded.
   */
  getResultPoints() {
    return this.resultPoints;
  }
  /**
   * @return {@link BarcodeFormat} representing the format of the barcode that was decoded
   */
  getBarcodeFormat() {
    return this.format;
  }
  /**
   * @return {@link Map} mapping {@link ResultMetadataType} keys to values. May be
   *   {@code null}. This contains optional metadata about what was detected about the barcode,
   *   like orientation.
   */
  getResultMetadata() {
    return this.resultMetadata;
  }
  putMetadata(type, value) {
    if (this.resultMetadata === null) {
      this.resultMetadata = /* @__PURE__ */ new Map();
    }
    this.resultMetadata.set(type, value);
  }
  putAllMetadata(metadata) {
    if (metadata !== null) {
      if (this.resultMetadata === null) {
        this.resultMetadata = metadata;
      } else {
        this.resultMetadata = new Map(metadata);
      }
    }
  }
  addResultPoints(newPoints) {
    const oldPoints = this.resultPoints;
    if (oldPoints === null) {
      this.resultPoints = newPoints;
    } else if (newPoints !== null && newPoints.length > 0) {
      const allPoints = new Array(oldPoints.length + newPoints.length);
      ZXingSystem.arraycopy(oldPoints, 0, allPoints, 0, oldPoints.length);
      ZXingSystem.arraycopy(newPoints, 0, allPoints, oldPoints.length, newPoints.length);
      this.resultPoints = allPoints;
    }
  }
  getTimestamp() {
    return this.timestamp;
  }
  /*@Override*/
  toString() {
    return this.text;
  }
}

export { Result };
//# sourceMappingURL=Result.js.map
//# sourceMappingURL=Result.js.map