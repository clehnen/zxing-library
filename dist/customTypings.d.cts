/**
 * This file contains some types to make our
 * lifes easier when copy and pasting Java code.
 * With it we can keep int, float, etc., references
 * in code to keep as close as possible as the Java version
 * but without the need to sacrifice ourselves with boring
 * and annoying things.
 */
declare type byte = number;
declare type short = number;
declare type int = number;
declare type float = number;
type char = number;
type List<T> = Array<T>;
type Collection<T> = Array<T>;
type Deque<T> = Array<T>;

export type { Collection, Deque, List, byte, char, float, int, short };
