import { ZXingStringBuilder } from '../../util/StringBuilder.js';
import { Dimension } from '../../Dimension.js';
import { SymbolShapeHint } from './constants.js';
import { DataMatrixSymbolInfo } from './DataMatrixSymbolInfo.js';
import '../../common/CharacterSetECI.js';
import '../../../customTypings.js';

declare class EncoderContext {
    private readonly msg;
    private shape;
    private minSize;
    private maxSize;
    private codewords;
    pos: number;
    private newEncoding;
    private symbolInfo;
    private skipAtEnd;
    constructor(msg: string);
    setSymbolShape(shape: SymbolShapeHint): void;
    setSizeConstraints(minSize: Dimension, maxSize: Dimension): void;
    getMessage(): string;
    setSkipAtEnd(count: number): void;
    getCurrentChar(): number;
    getCurrent(): number;
    getCodewords(): ZXingStringBuilder;
    writeCodewords(codewords: string): void;
    writeCodeword(codeword: number | string): void;
    getCodewordCount(): number;
    getNewEncoding(): number;
    signalEncoderChange(encoding: number): void;
    resetEncoderSignal(): void;
    hasMoreCharacters(): boolean;
    private getTotalMessageCharCount;
    getRemainingCharacters(): number;
    getSymbolInfo(): DataMatrixSymbolInfo;
    updateSymbolInfo(len?: number): void;
    resetSymbolInfo(): void;
}

export { EncoderContext };
