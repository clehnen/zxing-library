import { BitArray } from '../../../../common/BitArray.js';
import { ZXingStringBuilder } from '../../../../util/StringBuilder.js';
import { DecodedInformation } from './DecodedInformation.js';
import '../../../../common/CharacterSetECI.js';
import '../../../../../customTypings.js';
import './DecodedObject.js';

declare class GeneralAppIdDecoder {
    private readonly information;
    private readonly current;
    private readonly buffer;
    constructor(information: BitArray);
    decodeAllCodes(buff: ZXingStringBuilder, initialPosition: number): string;
    private isStillNumeric;
    private decodeNumeric;
    extractNumericValueFromBitArray(pos: number, bits: number): number;
    static extractNumericValueFromBitArray(information: BitArray, pos: number, bits: number): number;
    decodeGeneralPurposeField(pos: number, remaining: string): DecodedInformation;
    private parseBlocks;
    private parseNumericBlock;
    private parseIsoIec646Block;
    private parseAlphaBlock;
    private isStillIsoIec646;
    private decodeIsoIec646;
    private isStillAlpha;
    private decodeAlphanumeric;
    private isAlphaTo646ToAlphaLatch;
    private isAlphaOr646ToNumericLatch;
    private isNumericToAlphaNumericLatch;
}

export { GeneralAppIdDecoder };
