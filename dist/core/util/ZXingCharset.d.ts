import { CharacterSetECI } from '../common/CharacterSetECI.js';

/**
 * Just to make a shortcut between Java code and TS code.
 */
declare class ZXingCharset extends CharacterSetECI {
    static forName(name: string): ZXingCharset;
}

export { ZXingCharset };
