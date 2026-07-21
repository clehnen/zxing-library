import { AbstractRSSReader } from './AbstractRSSReader.cjs';
import { Result } from '../../Result.cjs';
import { BitArray } from '../../common/BitArray.cjs';
import { DecodeHintType } from '../../DecodeHintType.cjs';
import '../OneDReader.cjs';
import '../../BinaryBitmap.cjs';
import '../../Binarizer.cjs';
import '../../LuminanceSource.cjs';
import '../../common/BitMatrix.cjs';
import '../../../customTypings.cjs';
import '../../Reader.cjs';
import '../../ResultPoint.cjs';
import '../../BarcodeFormat.cjs';
import '../../ResultMetadataType.cjs';

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
