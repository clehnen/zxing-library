import { CharacterSetECI } from '../common/CharacterSetECI.cjs';
import { char, int } from '../../customTypings.cjs';

declare class ZXingStringBuilder {
    private value;
    private encoding;
    constructor(value?: string);
    enableDecoding(encoding: CharacterSetECI): ZXingStringBuilder;
    append(s: string | number): ZXingStringBuilder;
    appendChars(str: char[] | string[], offset: int, len: int): ZXingStringBuilder;
    length(): number;
    charAt(n: number): string;
    deleteCharAt(n: number): void;
    setCharAt(n: number, c: string): void;
    substring(start: int, end: int): string;
    /**
     * @note helper method for RSS Expanded
     */
    setLengthToZero(): void;
    toString(): string;
    insert(n: number, c: string): void;
}

export { ZXingStringBuilder };
