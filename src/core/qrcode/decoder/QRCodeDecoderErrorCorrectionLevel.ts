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


import { ArgumentException } from '../../ArgumentException';
import { IllegalArgumentException } from '../../IllegalArgumentException';

export enum ErrorCorrectionLevelValues {
    L,
    M,
    Q,
    H
}

/**
 * <p>See ISO 18004:2006, 6.5.1. This enum encapsulates the four error correction levels
 * defined by the QR code standard.</p>
 *
 * @author Sean Owen
 */
export class QRCodeDecoderErrorCorrectionLevel {

    private static FOR_BITS = new Map<number, QRCodeDecoderErrorCorrectionLevel>();
    private static FOR_VALUE = new Map<ErrorCorrectionLevelValues, QRCodeDecoderErrorCorrectionLevel>();

    /** L = ~7% correction */
    public static L = new QRCodeDecoderErrorCorrectionLevel(ErrorCorrectionLevelValues.L, 'L', 0x01);
    /** M = ~15% correction */
    public static M = new QRCodeDecoderErrorCorrectionLevel(ErrorCorrectionLevelValues.M, 'M', 0x00);
    /** Q = ~25% correction */
    public static Q = new QRCodeDecoderErrorCorrectionLevel(ErrorCorrectionLevelValues.Q, 'Q', 0x03);
    /** H = ~30% correction */
    public static H = new QRCodeDecoderErrorCorrectionLevel(ErrorCorrectionLevelValues.H, 'H', 0x02);

    private constructor(private value: ErrorCorrectionLevelValues, private stringValue: string, private bits: number /*int*/) {
        QRCodeDecoderErrorCorrectionLevel.FOR_BITS.set(bits, this);
        QRCodeDecoderErrorCorrectionLevel.FOR_VALUE.set(value, this);
    }

    public getValue(): ErrorCorrectionLevelValues/*int*/ {
        return this.value;
    }

    public getBits(): number /*int*/ {
        return this.bits;
    }

    public static fromString(s: string): QRCodeDecoderErrorCorrectionLevel {
        switch (s) {
            case 'L': return QRCodeDecoderErrorCorrectionLevel.L;
            case 'M': return QRCodeDecoderErrorCorrectionLevel.M;
            case 'Q': return QRCodeDecoderErrorCorrectionLevel.Q;
            case 'H': return QRCodeDecoderErrorCorrectionLevel.H;
            default: throw new ArgumentException(s + 'not available');
        }
    }

    public toString(): string {
        return this.stringValue;
    }

    public equals(o: any): boolean {
        if (!(o instanceof QRCodeDecoderErrorCorrectionLevel)) {
            return false;
        }
        const other = <QRCodeDecoderErrorCorrectionLevel>o;
        return this.value === other.value;
    }
    /**
     * @param bits int containing the two bits encoding a QR Code's error correction level
     * @return ErrorCorrectionLevel representing the encoded error correction level
     */
    public static forBits(bits: number /*int*/): QRCodeDecoderErrorCorrectionLevel {
        if (bits < 0 || bits >= QRCodeDecoderErrorCorrectionLevel.FOR_BITS.size) {
            throw new IllegalArgumentException();
        }
        return QRCodeDecoderErrorCorrectionLevel.FOR_BITS.get(bits);
    }

}
