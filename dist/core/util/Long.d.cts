/**
 * Ponyfill for Java's Long class.
 */
declare class Long {
    /**
     * Parses a string to a number, since JS has no really Int64.
     *
     * @param num Numeric string.
     * @param radix Destination radix.
     */
    static parseLong(num: string, radix?: number): number;
}

export { Long };
