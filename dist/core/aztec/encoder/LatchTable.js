const LATCH_TABLE = [
  Int32Array.from([
    0,
    (5 << 16) + 28,
    // UPPER -> LOWER
    (5 << 16) + 30,
    // UPPER -> DIGIT
    (5 << 16) + 29,
    // UPPER -> MIXED
    (10 << 16) + (29 << 5) + 30
    // UPPER -> MIXED -> PUNCT
  ]),
  Int32Array.from([
    (9 << 16) + (30 << 4) + 14,
    // LOWER -> DIGIT -> UPPER
    0,
    (5 << 16) + 30,
    // LOWER -> DIGIT
    (5 << 16) + 29,
    // LOWER -> MIXED
    (10 << 16) + (29 << 5) + 30
    // LOWER -> MIXED -> PUNCT
  ]),
  Int32Array.from([
    (4 << 16) + 14,
    // DIGIT -> UPPER
    (9 << 16) + (14 << 5) + 28,
    // DIGIT -> UPPER -> LOWER
    0,
    (9 << 16) + (14 << 5) + 29,
    // DIGIT -> UPPER -> MIXED
    (14 << 16) + (14 << 10) + (29 << 5) + 30
    // DIGIT -> UPPER -> MIXED -> PUNCT
  ]),
  Int32Array.from([
    (5 << 16) + 29,
    // MIXED -> UPPER
    (5 << 16) + 28,
    // MIXED -> LOWER
    (10 << 16) + (29 << 5) + 30,
    // MIXED -> UPPER -> DIGIT
    0,
    (5 << 16) + 30
    // MIXED -> PUNCT
  ]),
  Int32Array.from([
    (5 << 16) + 31,
    // PUNCT -> UPPER
    (10 << 16) + (31 << 5) + 28,
    // PUNCT -> UPPER -> LOWER
    (10 << 16) + (31 << 5) + 30,
    // PUNCT -> UPPER -> DIGIT
    (10 << 16) + (31 << 5) + 29,
    // PUNCT -> UPPER -> MIXED
    0
  ])
];
var LatchTable_default = {
  LATCH_TABLE
};

export { LATCH_TABLE, LatchTable_default as default };
//# sourceMappingURL=LatchTable.js.map
//# sourceMappingURL=LatchTable.js.map