import { CharacterSetECI } from '../common/CharacterSetECI';

/**
 * Just to make a shortcut between Java code and TS code.
 */
export class ZXingCharset extends CharacterSetECI {

  public static forName(name: string): ZXingCharset {
    return this.getCharacterSetECIByName(name);
  }

}
