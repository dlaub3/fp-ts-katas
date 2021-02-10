import {
  semigroupProduct,
  semigroupSum,
  getStructSemigroup,
  getFunctionSemigroup,
  Semigroup,
  semigroupAll,
  fold
} from "fp-ts/lib/Semigroup";
import { log } from "fp-ts/lib/Console";
import { pipe } from "fp-ts/lib/pipeable";
import { getApplySemigroup, some, Option } from "fp-ts/lib/Option";

/**
 * https://dev.to/gcanti/getting-started-with-fp-ts-semigroup-2mf7
 *
 * A semigroup is a pair (A, *) in which A is a non-empty set and * is a
 * binary associative operation on A, i.e. a function that takes two elements of A as
 * input and returns an element of A as output...
 * 
 * Associativity simply tells us that we do not have to worry about parenthesizing an expression and can write x * y * z.

    Semigroups capture the essence of parallelizable operations

  There are plenty of examples of semigroups:

      (number, *) where * is the usual multiplication of numbers
      (string, +) where + is the usual concatenation of strings
      (boolean, &&) where && is the usual conjunction

  and many more.
 *
 */

pipe(
  semigroupProduct.concat(10, 10),
  log
);

type Point = {
  x: number;
  y: number;
};

const semigroupPoint: Semigroup<Point> = getStructSemigroup({
  x: semigroupSum,
  y: semigroupSum
});

type Vector = {
  from: Point;
  to: Point;
};

const semigroupVector: Semigroup<Vector> = getStructSemigroup({
  from: semigroupPoint,
  to: semigroupPoint
});

pipe(
  semigroupVector.concat(
    {
      from: { x: 10, y: 1 },
      to: { x: 15, y: 3 }
    },
    {
      from: { x: 20, y: 1 },
      to: { x: 15, y: 13 }
    }
  ),
  log
);

const semigroupPredicate: Semigroup<
  (p: Point) => boolean
> = getFunctionSemigroup(semigroupAll)<Point>();

const isPositiveX = (p: Point): boolean => p.x >= 0;
const isPositiveY = (p: Point): boolean => p.y >= 0;

const isPositiveXY = semigroupPredicate.concat(isPositiveX, isPositiveY);

isPositiveXY({ x: 1, y: 1 }); // true

const sum = fold(semigroupSum);

sum(0, [1, 2, 3, 4]); // 10

const SemiOp = getApplySemigroup(semigroupSum);

const a = some(6);
const b = some(4);
const c = some(10);

pipe(
  SemiOp.concat(a, b),
  log
);

const sumOp = ([first, ...rest]: Option<number>[]) => fold(SemiOp)(first, rest);

pipe(
  sumOp([a, b, c]),
  log
);
