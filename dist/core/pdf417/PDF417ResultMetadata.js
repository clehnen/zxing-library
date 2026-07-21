class PDF417ResultMetadata {
  segmentIndex;
  fileId;
  lastSegment;
  segmentCount = -1;
  sender;
  addressee;
  fileName;
  fileSize = -1;
  timestamp = -1;
  checksum = -1;
  optionalData;
  /**
   * The Segment ID represents the segment of the whole file distributed over different symbols.
   *
   * @return File segment index
   */
  getSegmentIndex() {
    return this.segmentIndex;
  }
  setSegmentIndex(segmentIndex) {
    this.segmentIndex = segmentIndex;
  }
  /**
   * Is the same for each related PDF417 symbol
   *
   * @return File ID
   */
  getFileId() {
    return this.fileId;
  }
  setFileId(fileId) {
    this.fileId = fileId;
  }
  /**
   * @return always null
   * @deprecated use dedicated already parsed fields
   */
  //   @Deprecated
  getOptionalData() {
    return this.optionalData;
  }
  /**
   * @param optionalData old optional data format as int array
   * @deprecated parse and use new fields
   */
  //   @Deprecated
  setOptionalData(optionalData) {
    this.optionalData = optionalData;
  }
  /**
   * @return true if it is the last segment
   */
  isLastSegment() {
    return this.lastSegment;
  }
  setLastSegment(lastSegment) {
    this.lastSegment = lastSegment;
  }
  /**
   * @return count of segments, -1 if not set
   */
  getSegmentCount() {
    return this.segmentCount;
  }
  setSegmentCount(segmentCount) {
    this.segmentCount = segmentCount;
  }
  getSender() {
    return this.sender || null;
  }
  setSender(sender) {
    this.sender = sender;
  }
  getAddressee() {
    return this.addressee || null;
  }
  setAddressee(addressee) {
    this.addressee = addressee;
  }
  /**
   * Filename of the encoded file
   *
   * @return filename
   */
  getFileName() {
    return this.fileName;
  }
  setFileName(fileName) {
    this.fileName = fileName;
  }
  /**
   * filesize in bytes of the encoded file
   *
   * @return filesize in bytes, -1 if not set
   */
  getFileSize() {
    return this.fileSize;
  }
  setFileSize(fileSize) {
    this.fileSize = fileSize;
  }
  /**
   * 16-bit CRC checksum using CCITT-16
   *
   * @return crc checksum, -1 if not set
   */
  getChecksum() {
    return this.checksum;
  }
  setChecksum(checksum) {
    this.checksum = checksum;
  }
  /**
   * unix epock timestamp, elapsed seconds since 1970-01-01
   *
   * @return elapsed seconds, -1 if not set
   */
  getTimestamp() {
    return this.timestamp;
  }
  setTimestamp(timestamp) {
    this.timestamp = timestamp;
  }
}

export { PDF417ResultMetadata };
//# sourceMappingURL=PDF417ResultMetadata.js.map
//# sourceMappingURL=PDF417ResultMetadata.js.map