'use strict';

var IllegalStateException = require('../../../../IllegalStateException');
var GeneralAppIdDecoder = require('./GeneralAppIdDecoder');
var AI01AndOtherAIs = require('./AI01AndOtherAIs');
var AnyAIDecoder = require('./AnyAIDecoder');
var AI013103decoder = require('./AI013103decoder');
var AI01320xDecoder = require('./AI01320xDecoder');
var AI01392xDecoder = require('./AI01392xDecoder');
var AI01393xDecoder = require('./AI01393xDecoder');
var AI013x0x1xDecoder = require('./AI013x0x1xDecoder');

function createAbstractExpandedDecoder(information) {
  if (information.get(1)) {
    return new AI01AndOtherAIs.AI01AndOtherAIs(information);
  }
  if (!information.get(2)) {
    return new AnyAIDecoder.AnyAIDecoder(information);
  }
  const fourBitEncodationMethod = GeneralAppIdDecoder.GeneralAppIdDecoder.extractNumericValueFromBitArray(information, 1, 4);
  switch (fourBitEncodationMethod) {
    case 4:
      return new AI013103decoder.AI013103decoder(information);
    case 5:
      return new AI01320xDecoder.AI01320xDecoder(information);
  }
  const fiveBitEncodationMethod = GeneralAppIdDecoder.GeneralAppIdDecoder.extractNumericValueFromBitArray(information, 1, 5);
  switch (fiveBitEncodationMethod) {
    case 12:
      return new AI01392xDecoder.AI01392xDecoder(information);
    case 13:
      return new AI01393xDecoder.AI01393xDecoder(information);
  }
  const sevenBitEncodationMethod = GeneralAppIdDecoder.GeneralAppIdDecoder.extractNumericValueFromBitArray(information, 1, 7);
  switch (sevenBitEncodationMethod) {
    case 56:
      return new AI013x0x1xDecoder.AI013x0x1xDecoder(information, "310", "11");
    case 57:
      return new AI013x0x1xDecoder.AI013x0x1xDecoder(information, "320", "11");
    case 58:
      return new AI013x0x1xDecoder.AI013x0x1xDecoder(information, "310", "13");
    case 59:
      return new AI013x0x1xDecoder.AI013x0x1xDecoder(information, "320", "13");
    case 60:
      return new AI013x0x1xDecoder.AI013x0x1xDecoder(information, "310", "15");
    case 61:
      return new AI013x0x1xDecoder.AI013x0x1xDecoder(information, "320", "15");
    case 62:
      return new AI013x0x1xDecoder.AI013x0x1xDecoder(information, "310", "17");
    case 63:
      return new AI013x0x1xDecoder.AI013x0x1xDecoder(information, "320", "17");
  }
  throw new IllegalStateException.IllegalStateException("unknown decoder: " + information);
}

exports.createAbstractExpandedDecoder = createAbstractExpandedDecoder;
//# sourceMappingURL=AbstractExpandedDecoderComplement.cjs.map
//# sourceMappingURL=AbstractExpandedDecoderComplement.cjs.map