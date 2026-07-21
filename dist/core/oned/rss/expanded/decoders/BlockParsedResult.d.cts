import { DecodedInformation } from './DecodedInformation.cjs';
import './DecodedObject.cjs';

declare class BlockParsedResult {
    private readonly decodedInformation;
    private readonly finished;
    constructor(decodedInformation?: DecodedInformation | null, finished?: boolean);
    getDecodedInformation(): DecodedInformation | null;
    isFinished(): boolean;
}

export { BlockParsedResult };
