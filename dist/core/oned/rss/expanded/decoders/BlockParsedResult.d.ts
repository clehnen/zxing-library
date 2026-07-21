import { DecodedInformation } from './DecodedInformation.js';
import './DecodedObject.js';

declare class BlockParsedResult {
    private readonly decodedInformation;
    private readonly finished;
    constructor(decodedInformation?: DecodedInformation | null, finished?: boolean);
    getDecodedInformation(): DecodedInformation | null;
    isFinished(): boolean;
}

export { BlockParsedResult };
