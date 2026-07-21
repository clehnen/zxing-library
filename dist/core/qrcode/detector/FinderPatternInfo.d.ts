import { FinderPattern } from './FinderPattern.js';
import '../../ResultPoint.js';
import '../../../customTypings.js';

/**
 * <p>Encapsulates information about finder patterns in an image, including the location of
 * the three finder patterns, and their estimated module size.</p>
 *
 * @author Sean Owen
 */
declare class FinderPatternInfo {
    private bottomLeft;
    private topLeft;
    private topRight;
    constructor(patternCenters: FinderPattern[]);
    getBottomLeft(): FinderPattern;
    getTopLeft(): FinderPattern;
    getTopRight(): FinderPattern;
}

export { FinderPatternInfo };
