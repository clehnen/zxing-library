import { DecodedObject } from './DecodedObject.cjs';

declare class DecodedChar extends DecodedObject {
    private readonly value;
    static readonly FNC1 = "$";
    constructor(newPosition: number, value: string);
    getValue(): string;
    isFNC1(): boolean;
}

export { DecodedChar };
