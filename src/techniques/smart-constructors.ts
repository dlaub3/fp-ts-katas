/**
 * https://dev.to/gcanti/functional-design-smart-constructors-14nb
 *
 * Smart constructors help refine types
 *
 */
import {
  Option,
  none,
  some,
  option,
  apFirst,
  apSecond,
  chain,
  map,
  fromNullable,
  ap
} from "fp-ts/lib/Option";
import { pipe, pipeable } from "fp-ts/lib/pipeable";
import { flow } from "fp-ts/lib/function";

interface Person {
  name: string; // Want non-empty string
  age: number; // Want positive Integer
}

function person(name: string, age: number): Person {
  return { name, age };
}

const p = person("", -1.2); // no error

/**
 *
   1. define a type R which represents the refinement
   2. do not export a constructor for R
   3. do export a function (the smart constructor) with the following signature

   This is accomplished below using branded types
 **/

export interface NonEmptyStringBrand {
  readonly NonEmptyString: unique symbol; // ensures uniqueness across modules / packages
}

export type NonEmptyString = string & NonEmptyStringBrand;

// runtime check implemented as a custom type guard
function isNonEmptyString(s: string): s is NonEmptyString {
  return s.length > 0;
}

export function makeNonEmptyString(s: string): Option<NonEmptyString> {
  return isNonEmptyString(s) ? some(s) : none;
}

export interface IntBrand {
  readonly Int: unique symbol;
}

export type Int = number & IntBrand;

function isInt(n: number): n is Int {
  return Number.isInteger(n) && n >= 0;
}

export function makeInt(n: number): Option<Int> {
  return isInt(n) ? some(n) : none;
}

interface SmartPerson {
  name: NonEmptyString;
  age: Int;
}

const smartPerson = (name: NonEmptyString) => (age: Int): SmartPerson => {
  return { name, age };
};

const x = flow(
  makeNonEmptyString,
  ap
)("foo");

const y = pipe(
  12,
  makeInt,
  ap
);

const z = pipe(
  some(smartPerson),
  x,
  y
);

const zz = flow(
  () => some(smartPerson),
  x,
  y
)();

console.table(z, zz);
