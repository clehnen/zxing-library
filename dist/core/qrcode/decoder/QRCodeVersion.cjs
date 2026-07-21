'use strict';

var BitMatrix = require('../../common/BitMatrix');
var QRCodeDecoderFormatInformation = require('./QRCodeDecoderFormatInformation');
var ECBlocks = require('./ECBlocks');
var ECB = require('./ECB');
var FormatException = require('../../FormatException');
var IllegalArgumentException = require('../../IllegalArgumentException');

class QRCodeVersion {
  /*int*/
  constructor(versionNumber, alignmentPatternCenters, ...ecBlocks) {
    this.versionNumber = versionNumber;
    this.alignmentPatternCenters = alignmentPatternCenters;
    this.ecBlocks = ecBlocks;
    let total = 0;
    const ecCodewords = ecBlocks[0].getECCodewordsPerBlock();
    const ecbArray = ecBlocks[0].getECBlocks();
    for (const ecBlock of ecbArray) {
      total += ecBlock.getCount() * (ecBlock.getDataCodewords() + ecCodewords);
    }
    this.totalCodewords = total;
  }
  versionNumber;
  alignmentPatternCenters;
  /**
     * See ISO 18004:2006 Annex D.
     * Element i represents the raw version bits that specify version i + 7
     */
  static VERSION_DECODE_INFO = Int32Array.from([
    31892,
    34236,
    39577,
    42195,
    48118,
    51042,
    55367,
    58893,
    63784,
    68472,
    70749,
    76311,
    79154,
    84390,
    87683,
    92361,
    96236,
    102084,
    102881,
    110507,
    110734,
    117786,
    119615,
    126325,
    127568,
    133589,
    136944,
    141498,
    145311,
    150283,
    152622,
    158308,
    161089,
    167017
  ]);
  /**
     * See ISO 18004:2006 6.5.1 Table 9
     */
  static VERSIONS = [
    new QRCodeVersion(
      1,
      new Int32Array(0),
      new ECBlocks.ECBlocks(7, new ECB.ECB(1, 19)),
      new ECBlocks.ECBlocks(10, new ECB.ECB(1, 16)),
      new ECBlocks.ECBlocks(13, new ECB.ECB(1, 13)),
      new ECBlocks.ECBlocks(17, new ECB.ECB(1, 9))
    ),
    new QRCodeVersion(
      2,
      Int32Array.from([6, 18]),
      new ECBlocks.ECBlocks(10, new ECB.ECB(1, 34)),
      new ECBlocks.ECBlocks(16, new ECB.ECB(1, 28)),
      new ECBlocks.ECBlocks(22, new ECB.ECB(1, 22)),
      new ECBlocks.ECBlocks(28, new ECB.ECB(1, 16))
    ),
    new QRCodeVersion(
      3,
      Int32Array.from([6, 22]),
      new ECBlocks.ECBlocks(15, new ECB.ECB(1, 55)),
      new ECBlocks.ECBlocks(26, new ECB.ECB(1, 44)),
      new ECBlocks.ECBlocks(18, new ECB.ECB(2, 17)),
      new ECBlocks.ECBlocks(22, new ECB.ECB(2, 13))
    ),
    new QRCodeVersion(
      4,
      Int32Array.from([6, 26]),
      new ECBlocks.ECBlocks(20, new ECB.ECB(1, 80)),
      new ECBlocks.ECBlocks(18, new ECB.ECB(2, 32)),
      new ECBlocks.ECBlocks(26, new ECB.ECB(2, 24)),
      new ECBlocks.ECBlocks(16, new ECB.ECB(4, 9))
    ),
    new QRCodeVersion(
      5,
      Int32Array.from([6, 30]),
      new ECBlocks.ECBlocks(26, new ECB.ECB(1, 108)),
      new ECBlocks.ECBlocks(24, new ECB.ECB(2, 43)),
      new ECBlocks.ECBlocks(
        18,
        new ECB.ECB(2, 15),
        new ECB.ECB(2, 16)
      ),
      new ECBlocks.ECBlocks(
        22,
        new ECB.ECB(2, 11),
        new ECB.ECB(2, 12)
      )
    ),
    new QRCodeVersion(
      6,
      Int32Array.from([6, 34]),
      new ECBlocks.ECBlocks(18, new ECB.ECB(2, 68)),
      new ECBlocks.ECBlocks(16, new ECB.ECB(4, 27)),
      new ECBlocks.ECBlocks(24, new ECB.ECB(4, 19)),
      new ECBlocks.ECBlocks(28, new ECB.ECB(4, 15))
    ),
    new QRCodeVersion(
      7,
      Int32Array.from([6, 22, 38]),
      new ECBlocks.ECBlocks(20, new ECB.ECB(2, 78)),
      new ECBlocks.ECBlocks(18, new ECB.ECB(4, 31)),
      new ECBlocks.ECBlocks(
        18,
        new ECB.ECB(2, 14),
        new ECB.ECB(4, 15)
      ),
      new ECBlocks.ECBlocks(
        26,
        new ECB.ECB(4, 13),
        new ECB.ECB(1, 14)
      )
    ),
    new QRCodeVersion(
      8,
      Int32Array.from([6, 24, 42]),
      new ECBlocks.ECBlocks(24, new ECB.ECB(2, 97)),
      new ECBlocks.ECBlocks(
        22,
        new ECB.ECB(2, 38),
        new ECB.ECB(2, 39)
      ),
      new ECBlocks.ECBlocks(
        22,
        new ECB.ECB(4, 18),
        new ECB.ECB(2, 19)
      ),
      new ECBlocks.ECBlocks(
        26,
        new ECB.ECB(4, 14),
        new ECB.ECB(2, 15)
      )
    ),
    new QRCodeVersion(
      9,
      Int32Array.from([6, 26, 46]),
      new ECBlocks.ECBlocks(30, new ECB.ECB(2, 116)),
      new ECBlocks.ECBlocks(
        22,
        new ECB.ECB(3, 36),
        new ECB.ECB(2, 37)
      ),
      new ECBlocks.ECBlocks(
        20,
        new ECB.ECB(4, 16),
        new ECB.ECB(4, 17)
      ),
      new ECBlocks.ECBlocks(
        24,
        new ECB.ECB(4, 12),
        new ECB.ECB(4, 13)
      )
    ),
    new QRCodeVersion(
      10,
      Int32Array.from([6, 28, 50]),
      new ECBlocks.ECBlocks(
        18,
        new ECB.ECB(2, 68),
        new ECB.ECB(2, 69)
      ),
      new ECBlocks.ECBlocks(
        26,
        new ECB.ECB(4, 43),
        new ECB.ECB(1, 44)
      ),
      new ECBlocks.ECBlocks(
        24,
        new ECB.ECB(6, 19),
        new ECB.ECB(2, 20)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(6, 15),
        new ECB.ECB(2, 16)
      )
    ),
    new QRCodeVersion(
      11,
      Int32Array.from([6, 30, 54]),
      new ECBlocks.ECBlocks(20, new ECB.ECB(4, 81)),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(1, 50),
        new ECB.ECB(4, 51)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(4, 22),
        new ECB.ECB(4, 23)
      ),
      new ECBlocks.ECBlocks(
        24,
        new ECB.ECB(3, 12),
        new ECB.ECB(8, 13)
      )
    ),
    new QRCodeVersion(
      12,
      Int32Array.from([6, 32, 58]),
      new ECBlocks.ECBlocks(
        24,
        new ECB.ECB(2, 92),
        new ECB.ECB(2, 93)
      ),
      new ECBlocks.ECBlocks(
        22,
        new ECB.ECB(6, 36),
        new ECB.ECB(2, 37)
      ),
      new ECBlocks.ECBlocks(
        26,
        new ECB.ECB(4, 20),
        new ECB.ECB(6, 21)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(7, 14),
        new ECB.ECB(4, 15)
      )
    ),
    new QRCodeVersion(
      13,
      Int32Array.from([6, 34, 62]),
      new ECBlocks.ECBlocks(26, new ECB.ECB(4, 107)),
      new ECBlocks.ECBlocks(
        22,
        new ECB.ECB(8, 37),
        new ECB.ECB(1, 38)
      ),
      new ECBlocks.ECBlocks(
        24,
        new ECB.ECB(8, 20),
        new ECB.ECB(4, 21)
      ),
      new ECBlocks.ECBlocks(
        22,
        new ECB.ECB(12, 11),
        new ECB.ECB(4, 12)
      )
    ),
    new QRCodeVersion(
      14,
      Int32Array.from([6, 26, 46, 66]),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(3, 115),
        new ECB.ECB(1, 116)
      ),
      new ECBlocks.ECBlocks(
        24,
        new ECB.ECB(4, 40),
        new ECB.ECB(5, 41)
      ),
      new ECBlocks.ECBlocks(
        20,
        new ECB.ECB(11, 16),
        new ECB.ECB(5, 17)
      ),
      new ECBlocks.ECBlocks(
        24,
        new ECB.ECB(11, 12),
        new ECB.ECB(5, 13)
      )
    ),
    new QRCodeVersion(
      15,
      Int32Array.from([6, 26, 48, 70]),
      new ECBlocks.ECBlocks(
        22,
        new ECB.ECB(5, 87),
        new ECB.ECB(1, 88)
      ),
      new ECBlocks.ECBlocks(
        24,
        new ECB.ECB(5, 41),
        new ECB.ECB(5, 42)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(5, 24),
        new ECB.ECB(7, 25)
      ),
      new ECBlocks.ECBlocks(
        24,
        new ECB.ECB(11, 12),
        new ECB.ECB(7, 13)
      )
    ),
    new QRCodeVersion(
      16,
      Int32Array.from([6, 26, 50, 74]),
      new ECBlocks.ECBlocks(
        24,
        new ECB.ECB(5, 98),
        new ECB.ECB(1, 99)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(7, 45),
        new ECB.ECB(3, 46)
      ),
      new ECBlocks.ECBlocks(
        24,
        new ECB.ECB(15, 19),
        new ECB.ECB(2, 20)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(3, 15),
        new ECB.ECB(13, 16)
      )
    ),
    new QRCodeVersion(
      17,
      Int32Array.from([6, 30, 54, 78]),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(1, 107),
        new ECB.ECB(5, 108)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(10, 46),
        new ECB.ECB(1, 47)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(1, 22),
        new ECB.ECB(15, 23)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(2, 14),
        new ECB.ECB(17, 15)
      )
    ),
    new QRCodeVersion(
      18,
      Int32Array.from([6, 30, 56, 82]),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(5, 120),
        new ECB.ECB(1, 121)
      ),
      new ECBlocks.ECBlocks(
        26,
        new ECB.ECB(9, 43),
        new ECB.ECB(4, 44)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(17, 22),
        new ECB.ECB(1, 23)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(2, 14),
        new ECB.ECB(19, 15)
      )
    ),
    new QRCodeVersion(
      19,
      Int32Array.from([6, 30, 58, 86]),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(3, 113),
        new ECB.ECB(4, 114)
      ),
      new ECBlocks.ECBlocks(
        26,
        new ECB.ECB(3, 44),
        new ECB.ECB(11, 45)
      ),
      new ECBlocks.ECBlocks(
        26,
        new ECB.ECB(17, 21),
        new ECB.ECB(4, 22)
      ),
      new ECBlocks.ECBlocks(
        26,
        new ECB.ECB(9, 13),
        new ECB.ECB(16, 14)
      )
    ),
    new QRCodeVersion(
      20,
      Int32Array.from([6, 34, 62, 90]),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(3, 107),
        new ECB.ECB(5, 108)
      ),
      new ECBlocks.ECBlocks(
        26,
        new ECB.ECB(3, 41),
        new ECB.ECB(13, 42)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(15, 24),
        new ECB.ECB(5, 25)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(15, 15),
        new ECB.ECB(10, 16)
      )
    ),
    new QRCodeVersion(
      21,
      Int32Array.from([6, 28, 50, 72, 94]),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(4, 116),
        new ECB.ECB(4, 117)
      ),
      new ECBlocks.ECBlocks(26, new ECB.ECB(17, 42)),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(17, 22),
        new ECB.ECB(6, 23)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(19, 16),
        new ECB.ECB(6, 17)
      )
    ),
    new QRCodeVersion(
      22,
      Int32Array.from([6, 26, 50, 74, 98]),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(2, 111),
        new ECB.ECB(7, 112)
      ),
      new ECBlocks.ECBlocks(28, new ECB.ECB(17, 46)),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(7, 24),
        new ECB.ECB(16, 25)
      ),
      new ECBlocks.ECBlocks(24, new ECB.ECB(34, 13))
    ),
    new QRCodeVersion(
      23,
      Int32Array.from([6, 30, 54, 78, 102]),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(4, 121),
        new ECB.ECB(5, 122)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(4, 47),
        new ECB.ECB(14, 48)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(11, 24),
        new ECB.ECB(14, 25)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(16, 15),
        new ECB.ECB(14, 16)
      )
    ),
    new QRCodeVersion(
      24,
      Int32Array.from([6, 28, 54, 80, 106]),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(6, 117),
        new ECB.ECB(4, 118)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(6, 45),
        new ECB.ECB(14, 46)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(11, 24),
        new ECB.ECB(16, 25)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(30, 16),
        new ECB.ECB(2, 17)
      )
    ),
    new QRCodeVersion(
      25,
      Int32Array.from([6, 32, 58, 84, 110]),
      new ECBlocks.ECBlocks(
        26,
        new ECB.ECB(8, 106),
        new ECB.ECB(4, 107)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(8, 47),
        new ECB.ECB(13, 48)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(7, 24),
        new ECB.ECB(22, 25)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(22, 15),
        new ECB.ECB(13, 16)
      )
    ),
    new QRCodeVersion(
      26,
      Int32Array.from([6, 30, 58, 86, 114]),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(10, 114),
        new ECB.ECB(2, 115)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(19, 46),
        new ECB.ECB(4, 47)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(28, 22),
        new ECB.ECB(6, 23)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(33, 16),
        new ECB.ECB(4, 17)
      )
    ),
    new QRCodeVersion(
      27,
      Int32Array.from([6, 34, 62, 90, 118]),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(8, 122),
        new ECB.ECB(4, 123)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(22, 45),
        new ECB.ECB(3, 46)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(8, 23),
        new ECB.ECB(26, 24)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(12, 15),
        new ECB.ECB(28, 16)
      )
    ),
    new QRCodeVersion(
      28,
      Int32Array.from([6, 26, 50, 74, 98, 122]),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(3, 117),
        new ECB.ECB(10, 118)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(3, 45),
        new ECB.ECB(23, 46)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(4, 24),
        new ECB.ECB(31, 25)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(11, 15),
        new ECB.ECB(31, 16)
      )
    ),
    new QRCodeVersion(
      29,
      Int32Array.from([6, 30, 54, 78, 102, 126]),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(7, 116),
        new ECB.ECB(7, 117)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(21, 45),
        new ECB.ECB(7, 46)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(1, 23),
        new ECB.ECB(37, 24)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(19, 15),
        new ECB.ECB(26, 16)
      )
    ),
    new QRCodeVersion(
      30,
      Int32Array.from([6, 26, 52, 78, 104, 130]),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(5, 115),
        new ECB.ECB(10, 116)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(19, 47),
        new ECB.ECB(10, 48)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(15, 24),
        new ECB.ECB(25, 25)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(23, 15),
        new ECB.ECB(25, 16)
      )
    ),
    new QRCodeVersion(
      31,
      Int32Array.from([6, 30, 56, 82, 108, 134]),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(13, 115),
        new ECB.ECB(3, 116)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(2, 46),
        new ECB.ECB(29, 47)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(42, 24),
        new ECB.ECB(1, 25)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(23, 15),
        new ECB.ECB(28, 16)
      )
    ),
    new QRCodeVersion(
      32,
      Int32Array.from([6, 34, 60, 86, 112, 138]),
      new ECBlocks.ECBlocks(30, new ECB.ECB(17, 115)),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(10, 46),
        new ECB.ECB(23, 47)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(10, 24),
        new ECB.ECB(35, 25)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(19, 15),
        new ECB.ECB(35, 16)
      )
    ),
    new QRCodeVersion(
      33,
      Int32Array.from([6, 30, 58, 86, 114, 142]),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(17, 115),
        new ECB.ECB(1, 116)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(14, 46),
        new ECB.ECB(21, 47)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(29, 24),
        new ECB.ECB(19, 25)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(11, 15),
        new ECB.ECB(46, 16)
      )
    ),
    new QRCodeVersion(
      34,
      Int32Array.from([6, 34, 62, 90, 118, 146]),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(13, 115),
        new ECB.ECB(6, 116)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(14, 46),
        new ECB.ECB(23, 47)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(44, 24),
        new ECB.ECB(7, 25)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(59, 16),
        new ECB.ECB(1, 17)
      )
    ),
    new QRCodeVersion(
      35,
      Int32Array.from([6, 30, 54, 78, 102, 126, 150]),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(12, 121),
        new ECB.ECB(7, 122)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(12, 47),
        new ECB.ECB(26, 48)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(39, 24),
        new ECB.ECB(14, 25)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(22, 15),
        new ECB.ECB(41, 16)
      )
    ),
    new QRCodeVersion(
      36,
      Int32Array.from([6, 24, 50, 76, 102, 128, 154]),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(6, 121),
        new ECB.ECB(14, 122)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(6, 47),
        new ECB.ECB(34, 48)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(46, 24),
        new ECB.ECB(10, 25)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(2, 15),
        new ECB.ECB(64, 16)
      )
    ),
    new QRCodeVersion(
      37,
      Int32Array.from([6, 28, 54, 80, 106, 132, 158]),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(17, 122),
        new ECB.ECB(4, 123)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(29, 46),
        new ECB.ECB(14, 47)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(49, 24),
        new ECB.ECB(10, 25)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(24, 15),
        new ECB.ECB(46, 16)
      )
    ),
    new QRCodeVersion(
      38,
      Int32Array.from([6, 32, 58, 84, 110, 136, 162]),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(4, 122),
        new ECB.ECB(18, 123)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(13, 46),
        new ECB.ECB(32, 47)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(48, 24),
        new ECB.ECB(14, 25)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(42, 15),
        new ECB.ECB(32, 16)
      )
    ),
    new QRCodeVersion(
      39,
      Int32Array.from([6, 26, 54, 82, 110, 138, 166]),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(20, 117),
        new ECB.ECB(4, 118)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(40, 47),
        new ECB.ECB(7, 48)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(43, 24),
        new ECB.ECB(22, 25)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(10, 15),
        new ECB.ECB(67, 16)
      )
    ),
    new QRCodeVersion(
      40,
      Int32Array.from([6, 30, 58, 86, 114, 142, 170]),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(19, 118),
        new ECB.ECB(6, 119)
      ),
      new ECBlocks.ECBlocks(
        28,
        new ECB.ECB(18, 47),
        new ECB.ECB(31, 48)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(34, 24),
        new ECB.ECB(34, 25)
      ),
      new ECBlocks.ECBlocks(
        30,
        new ECB.ECB(20, 15),
        new ECB.ECB(61, 16)
      )
    )
  ];
  ecBlocks;
  totalCodewords;
  getVersionNumber() {
    return this.versionNumber;
  }
  getAlignmentPatternCenters() {
    return this.alignmentPatternCenters;
  }
  getTotalCodewords() {
    return this.totalCodewords;
  }
  getDimensionForVersion() {
    return 17 + 4 * this.versionNumber;
  }
  getECBlocksForLevel(ecLevel) {
    return this.ecBlocks[ecLevel.getValue()];
  }
  /**
   * <p>Deduces version information purely from QR Code dimensions.</p>
   *
   * @param dimension dimension in modules
   * @return Version for a QR Code of that dimension
   * @throws FormatException if dimension is not 1 mod 4
   */
  static getProvisionalVersionForDimension(dimension) {
    if (dimension % 4 !== 1) {
      throw new FormatException.FormatException();
    }
    try {
      return this.getVersionForNumber((dimension - 17) / 4);
    } catch (ignored) {
      throw new FormatException.FormatException();
    }
  }
  static getVersionForNumber(versionNumber) {
    if (versionNumber < 1 || versionNumber > 40) {
      throw new IllegalArgumentException.IllegalArgumentException();
    }
    return QRCodeVersion.VERSIONS[versionNumber - 1];
  }
  static decodeVersionInformation(versionBits) {
    let bestDifference = Number.MAX_SAFE_INTEGER;
    let bestVersion = 0;
    for (let i = 0; i < QRCodeVersion.VERSION_DECODE_INFO.length; i++) {
      const targetVersion = QRCodeVersion.VERSION_DECODE_INFO[i];
      if (targetVersion === versionBits) {
        return QRCodeVersion.getVersionForNumber(i + 7);
      }
      const bitsDifference = QRCodeDecoderFormatInformation.QRCodeDecoderFormatInformation.numBitsDiffering(versionBits, targetVersion);
      if (bitsDifference < bestDifference) {
        bestVersion = i + 7;
        bestDifference = bitsDifference;
      }
    }
    if (bestDifference <= 3) {
      return QRCodeVersion.getVersionForNumber(bestVersion);
    }
    return null;
  }
  /**
   * See ISO 18004:2006 Annex E
   */
  buildFunctionPattern() {
    const dimension = this.getDimensionForVersion();
    const bitMatrix = new BitMatrix.BitMatrix(dimension);
    bitMatrix.setRegion(0, 0, 9, 9);
    bitMatrix.setRegion(dimension - 8, 0, 8, 9);
    bitMatrix.setRegion(0, dimension - 8, 9, 8);
    const max = this.alignmentPatternCenters.length;
    for (let x = 0; x < max; x++) {
      const i = this.alignmentPatternCenters[x] - 2;
      for (let y = 0; y < max; y++) {
        if (x === 0 && (y === 0 || y === max - 1) || x === max - 1 && y === 0) {
          continue;
        }
        bitMatrix.setRegion(this.alignmentPatternCenters[y] - 2, i, 5, 5);
      }
    }
    bitMatrix.setRegion(6, 9, 1, dimension - 17);
    bitMatrix.setRegion(9, 6, dimension - 17, 1);
    if (this.versionNumber > 6) {
      bitMatrix.setRegion(dimension - 11, 0, 3, 6);
      bitMatrix.setRegion(0, dimension - 11, 6, 3);
    }
    return bitMatrix;
  }
  /*@Override*/
  toString() {
    return "" + this.versionNumber;
  }
}

exports.QRCodeVersion = QRCodeVersion;
//# sourceMappingURL=QRCodeVersion.cjs.map
//# sourceMappingURL=QRCodeVersion.cjs.map