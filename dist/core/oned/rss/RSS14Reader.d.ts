import { AbstractRSSReader } from './AbstractRSSReader.js';
import { Result } from '../../Result.js';
import { BitArray } from '../../common/BitArray.js';
import { DecodeHintType } from '../../DecodeHintType.js';
import '../OneDReader.js';
import '../../BinaryBitmap.js';
import '../../Binarizer.js';
import '../../LuminanceSource.js';
import '../../common/BitMatrix.js';
import '../../../customTypings.js';
import '../../Reader.js';
import '../../ResultPoint.js';
import '../../BarcodeFormat.js';
import '../../ResultMetadataType.js';

declare class RSS14Reader extends AbstractRSSReader {
    private static readonly OUTSIDE_EVEN_TOTAL_SUBSET;
    private static readonly INSIDE_ODD_TOTAL_SUBSET;
    private static readonly OUTSIDE_GSUM;
    private static readonly INSIDE_GSUM;
    private static readonly OUTSIDE_ODD_WIDEST;
    private static readonly INSIDE_ODD_WIDEST;
    private static readonly FINDER_PATTERNS;
    private readonly possibleLeftPairs;
    private readonly possibleRightPairs;
    decodeRow(rowNumber: number, row: BitArray, hints?: Map<DecodeHintType, any>): Result;
    private static addOrTally;
    reset(): void;
    private static constructResult;
    private static checkChecksum;
    private decodePair;
    private decodeDataCharacter;
    private findFinderPattern;
    private parseFoundFinderPattern;
    private adjustOddEvenCounts;
}

export { RSS14Reader };
