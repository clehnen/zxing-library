class VideoInputDevice {
  /**
   * Creates an instance of VideoInputDevice.
   *
   * @param {string} deviceId the video input device id
   * @param {string} label the label of the device if available
   */
  constructor(deviceId, label, groupId) {
    this.deviceId = deviceId;
    this.label = label;
    this.groupId = groupId || void 0;
  }
  deviceId;
  label;
  /** @inheritdoc */
  kind = "videoinput";
  /** @inheritdoc */
  groupId;
  /** @inheritdoc */
  toJSON() {
    return {
      kind: this.kind,
      groupId: this.groupId,
      deviceId: this.deviceId,
      label: this.label
    };
  }
}

export { VideoInputDevice };
//# sourceMappingURL=VideoInputDevice.js.map
//# sourceMappingURL=VideoInputDevice.js.map