/*
 * Copyright 2008 ZXing authors
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

/*namespace com.google.zxing.qrcode.encoder {*/

import { QRCodeDecoderErrorCorrectionLevel } from '../decoder/QRCodeDecoderErrorCorrectionLevel';
import { QRCodeMode } from '../decoder/QRCodeMode';
import { QRCodeVersion } from '../decoder/QRCodeVersion';
import { ZXingStringBuilder } from '../../util/StringBuilder';
import { QRCodeByteMatrix } from './QRCodeByteMatrix';

/**
 * @author satorux@google.com (Satoru Takabayashi) - creator
 * @author dswitkin@google.com (Daniel Switkin) - ported from C++
 */
export class QRCodeEncoderQRCode {

    public static NUM_MASK_PATTERNS = 8;

    private mode: QRCodeMode;
    private ecLevel: QRCodeDecoderErrorCorrectionLevel;
    private version: QRCodeVersion;
    private maskPattern: number; /*int*/
    private matrix: QRCodeByteMatrix;

    public constructor() {
        this.maskPattern = -1;
    }

    public getMode(): QRCodeMode {
        return this.mode;
    }

    public getECLevel(): QRCodeDecoderErrorCorrectionLevel {
        return this.ecLevel;
    }

    public getVersion(): QRCodeVersion {
        return this.version;
    }

    public getMaskPattern(): number /*int*/ {
        return this.maskPattern;
    }

    public getMatrix(): QRCodeByteMatrix {
        return this.matrix;
    }

    /*@Override*/
    public toString(): string {
        const result = new ZXingStringBuilder(); // (200)
        result.append('<<\n');
        result.append(' mode: ');
        result.append(this.mode ? this.mode.toString() : 'null');
        result.append('\n ecLevel: ');
        result.append(this.ecLevel ? this.ecLevel.toString() : 'null');
        result.append('\n version: ');
        result.append(this.version ? this.version.toString() : 'null');
        result.append('\n maskPattern: ');
        result.append(this.maskPattern.toString());
        if (this.matrix) {
            result.append('\n matrix:\n');
            result.append(this.matrix.toString());
        } else {
            result.append('\n matrix: null\n');
        }
        result.append('>>\n');
        return result.toString();
    }

    public setMode(value: QRCodeMode): void {
        this.mode = value;
    }

    public setECLevel(value: QRCodeDecoderErrorCorrectionLevel): void {
        this.ecLevel = value;
    }

    public setVersion(version: QRCodeVersion): void {
        this.version = version;
    }

    public setMaskPattern(value: number /*int*/): void {
        this.maskPattern = value;
    }

    public setMatrix(value: QRCodeByteMatrix): void {
        this.matrix = value;
    }

    // Check if "mask_pattern" is valid.
    public static isValidMaskPattern(maskPattern: number /*int*/): boolean {
        return maskPattern >= 0 && maskPattern < QRCodeEncoderQRCode.NUM_MASK_PATTERNS;
    }

}
