'use strict';

var CharacterSetECI = require('../common/CharacterSetECI');

class ZXingCharset extends CharacterSetECI.CharacterSetECI {
  static forName(name) {
    return this.getCharacterSetECIByName(name);
  }
}

exports.ZXingCharset = ZXingCharset;
//# sourceMappingURL=ZXingCharset.cjs.map
//# sourceMappingURL=ZXingCharset.cjs.map