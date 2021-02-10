/**
 * https://dev.to/gcanti/functional-design-combinators-14pn
 *
 * Eq
 * Contramap
 * contramap: given an instance of Eq
 * for A and a function from B to A, we can derive an instance of Eq for B
 */

import { Eq } from "fp-ts/lib/Eq";
import {} from "fp-ts/lib/Ord";
import { IO, io } from "fp-ts/lib/IO";
import { Monoid, fold } from "fp-ts/lib/Monoid";
import { replicate } from "fp-ts/lib/Array";
import { chain } from "fp-ts/lib/IO";
import { pipe } from "fp-ts/lib/pipeable";
import { now } from "fp-ts/lib/Date";
import { fold as foldSemi, getMeetSemigroup } from "fp-ts/lib/Semigroup";
import { ordNumber, contramap } from "fp-ts/lib/Ord";
import { getSemigroup } from "fp-ts/lib/IO";

// import { log } from 'fp-ts/lib/Console'
// import { randomInt } from "fp-ts/lib/Random";

// export const contramap = <A, B>(f: (b: B) => A) => (E: Eq<A>): Eq<B> => {
//   return {
//     equals: (x, y) => E.equals(f(x), f(y))
//   };
// };

/**
 *
 * The getIOMonoid combinator: given an instance of Monoid for A,
 * we can derive an instance of Monoid for IO<A>
 */
export function getIOMonoid<A>(M: Monoid<A>): Monoid<IO<A>> {
  return {
    concat: (x, y) => () => M.concat(x(), y()),
    empty: () => M.empty
  };
}

/** a primitive `Monoid` instance for `void` */
export const monoidVoid: Monoid<void> = {
  concat: () => undefined,
  empty: undefined
};

export function replicateIO(n: number, mv: IO<void>): IO<void> {
  return fold(getIOMonoid(monoidVoid))(replicate(n, mv));
}

export function log(message: unknown): IO<void> {
  return () => console.log(message);
}

export const randomInt = (low: number, high: number): IO<number> => {
  return () => Math.floor((high - low + 1) * Math.random() + low);
};

function fib(n: number): number {
  return n <= 1 ? 1 : fib(n - 1) + fib(n - 2);
}

const printFib: IO<void> = pipe(
  randomInt(30, 35),
  chain(n => log(fib(n)))
);

replicateIO(3, printFib)();

// export function time<A>(ma: IO<A>): IO<A> {
//   return io.chain(now, start =>
//     io.chain(ma, a =>
//       io.chain(now, end => io.map(log(`Elapsed: ${end - start}`), () => a))
//     )
//   );
// }

// time(replicateIO(3, printFib))();

// time(replicateIO(3, time(printFib)))();

export function time<A>(ma: IO<A>): IO<[A, number]> {
  return io.chain(now, start =>
    io.chain(ma, a => io.map(now, end => [a, end - start]))
  );
}

export function withLogging<A>(ma: IO<A>): IO<A> {
  return io.chain(time(ma), ([a, millis]) =>
    io.map(log(`Result: ${a}, Elapsed: ${millis}`), () => a)
  );
}

export function ignoreSnd<A>(ma: IO<[A, unknown]>): IO<A> {
  return io.map(ma, ([a]) => a);
}

const program = withLogging(io.map(randomInt(30, 35), fib));

export function fastest<A>(head: IO<A>, tail: Array<IO<A>>): IO<A> {
  const ordTuple = contramap(([_, elapsed]: [A, number]) => elapsed)(ordNumber);
  const semigroupTuple = getMeetSemigroup(ordTuple);
  const semigroupIO = getSemigroup(semigroupTuple);
  const fastest = foldSemi(semigroupIO)(time(head), tail.map(time));
  return ignoreSnd(fastest);
}

program();
