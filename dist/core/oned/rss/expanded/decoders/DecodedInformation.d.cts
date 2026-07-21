import { DecodedObject } from './DecodedObject.cjs';

declare class DecodedInformation extends DecodedObject {
    private readonly newString;
    private readonly remainingValue;
    private readonly remaining;
    constructor(newPosition: number, newString: string, remainingValue?: number);
    getNewString(): string;
    isRemaining(): boolean;
    getRemainingValue(): number;
}

export { DecodedInformation };
