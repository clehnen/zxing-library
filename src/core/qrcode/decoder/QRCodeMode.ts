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

/*namespace com.google.zxing.qrcode.decoder {*/


import { QRCodeVersion } from './QRCodeVersion';
import { IllegalArgumentException } from '../../IllegalArgumentException';

export enum ModeValues {
    TERMINATOR, // Not really a mode...
    NUMERIC,
    ALPHANUMERIC,
    STRUCTURED_APPEND, // Not supported
    BYTE,
    ECI, // character counts don't apply
    KANJI,
    FNC1_FIRST_POSITION,
    FNC1_SECOND_POSITION,
    /** See GBT 18284-2000; "Hanzi" is a transliteration of this mode name. */
    HANZI
}

/**
 * <p>See ISO 18004:2006, 6.4.1, Tables 2 and 3. This enum encapsulates the various modes in which
 * data can be encoded to bits in the QR code standard.</p>
 *
 * @author Sean Owen
 */
export class QRCodeMode {

    private static FOR_BITS = new Map<number, QRCodeMode>();
    private static FOR_VALUE = new Map<ModeValues, QRCodeMode>();

    public static TERMINATOR = new QRCodeMode(ModeValues.TERMINATOR, 'TERMINATOR', Int32Array.from([0, 0, 0]), 0x00); // Not really a mode...
    public static NUMERIC = new QRCodeMode(ModeValues.NUMERIC, 'NUMERIC', Int32Array.from([10, 12, 14]), 0x01);
    public static ALPHANUMERIC = new QRCodeMode(ModeValues.ALPHANUMERIC, 'ALPHANUMERIC', Int32Array.from([9, 11, 13]), 0x02);
    public static STRUCTURED_APPEND = new QRCodeMode(ModeValues.STRUCTURED_APPEND, 'STRUCTURED_APPEND', Int32Array.from([0, 0, 0]), 0x03); // Not supported
    public static BYTE = new QRCodeMode(ModeValues.BYTE, 'BYTE', Int32Array.from([8, 16, 16]), 0x04);
    public static ECI = new QRCodeMode(ModeValues.ECI, 'ECI', Int32Array.from([0, 0, 0]), 0x07); // character counts don't apply
    public static KANJI = new QRCodeMode(ModeValues.KANJI, 'KANJI', Int32Array.from([8, 10, 12]), 0x08);
    public static FNC1_FIRST_POSITION = new QRCodeMode(ModeValues.FNC1_FIRST_POSITION, 'FNC1_FIRST_POSITION', Int32Array.from([0, 0, 0]), 0x05);
    public static FNC1_SECOND_POSITION = new QRCodeMode(ModeValues.FNC1_SECOND_POSITION, 'FNC1_SECOND_POSITION', Int32Array.from([0, 0, 0]), 0x09);
    /** See GBT 18284-2000; "Hanzi" is a transliteration of this mode name. */
    public static HANZI = new QRCodeMode(ModeValues.HANZI, 'HANZI', Int32Array.from([8, 10, 12]), 0x0D);

    private constructor(private value: ModeValues, private stringValue: string, private characterCountBitsForVersions: Int32Array, private bits: number /*int*/) {
        QRCodeMode.FOR_BITS.set(bits, this);
        QRCodeMode.FOR_VALUE.set(value, this);
    }

    /**
     * @param bits four bits encoding a QR Code data mode
     * @return Mode encoded by these bits
     * @throws IllegalArgumentException if bits do not correspond to a known mode
     */
    public static forBits(bits: number /*int*/): QRCodeMode {
        const mode = QRCodeMode.FOR_BITS.get(bits);
        if (undefined === mode) {
            throw new IllegalArgumentException();
        }
        return mode;
    }

    /**
     * @param version version in question
     * @return number of bits used, in this QR Code symbol {@link QRCodeVersion}, to encode the
     *         count of characters that will follow encoded in this Mode
     */
    public getCharacterCountBits(version: QRCodeVersion): number /*int*/ {
        const versionNumber = version.getVersionNumber();

        let offset;

        if (versionNumber <= 9) {
            offset = 0;
        } else if (versionNumber <= 26) {
            offset = 1;
        } else {
            offset = 2;
        }

        return this.characterCountBitsForVersions[offset];
    }

    public getValue(): ModeValues/*int*/ {
        return this.value;
    }

    public getBits(): number /*int*/ {
        return this.bits;
    }

    public equals(o: any): boolean {
        if (!(o instanceof QRCodeMode)) {
            return false;
        }
        const other = <QRCodeMode>o;
        return this.value === other.value;
    }

    public toString(): string {
        return this.stringValue;
    }
}
