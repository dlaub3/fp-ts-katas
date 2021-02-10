/**
 * Apply own the ap operation.
 *
 * A function wrapped in an option can recieve arguments
 * that are also wrapped in a function
 *
 * https://dev.to/gcanti/getting-started-with-fp-ts-applicative-1kb3
 */
import { Functor } from "fp-ts/lib/Functor";
import { HKT } from "fp-ts/lib/HKT";
import { some, ap, getApplyMonoid } from "fp-ts/lib/Option";
import { monoidProduct, monoidSum } from "fp-ts/lib/Monoid";
import { Apply3, sequenceS, sequenceT } from "fp-ts/lib/Apply";

interface Apply<F> extends Functor<F> {
  ap: <C, D>(fcd: HKT<F, (c: C) => D>, fc: HKT<F, C>) => HKT<F, D>;
}

const n = ap(some(10))(some((v: number) => v + 10));
