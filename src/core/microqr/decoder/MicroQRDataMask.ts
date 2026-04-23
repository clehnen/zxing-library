/*
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import BitMatrix from '../../common/BitMatrix';

/**
 * Micro QR Code data mask patterns (ISO 18004 Annex E).
 *
 * Micro QR uses 4 of the 8 QR mask patterns (indices 0-3):
 *   0: (i + j) mod 2 = 0
 *   1: i mod 2 = 0
 *   2: j mod 3 = 0
 *   3: (i + j) mod 3 = 0
 *
 * Where i = row, j = column.
 */
export default class MicroQRDataMask {

    private constructor(
        private readonly maskIndex: number,
        private readonly isMasked: (i: number, j: number) => boolean
    ) {}

    private static readonly MASKS: ReadonlyArray<MicroQRDataMask> = [
        new MicroQRDataMask(0, (i, j) => ((i + j) & 0x01) === 0),
        new MicroQRDataMask(1, (i, j) => (i & 0x01) === 0),
        new MicroQRDataMask(2, (i, j) => (j % 3) === 0),
        new MicroQRDataMask(3, (i, j) => ((i + j) % 3) === 0),
    ];

    public static forIndex(maskIndex: number): MicroQRDataMask {
        if (maskIndex < 0 || maskIndex >= MicroQRDataMask.MASKS.length) {
            throw new Error('Invalid Micro QR mask index: ' + maskIndex);
        }
        return MicroQRDataMask.MASKS[maskIndex];
    }

    /**
     * Un-mask a BitMatrix (XOR mask bits).
     * Applies to the entire matrix; function modules will be ignored by the parser.
     */
    public unmaskBitMatrix(bits: BitMatrix, dimension: number): void {
        for (let i = 0; i < dimension; i++) {
            for (let j = 0; j < dimension; j++) {
                if (this.isMasked(i, j)) {
                    bits.flip(j, i); // BitMatrix.flip(x, y) where x=col, y=row
                }
            }
        }
    }
}
