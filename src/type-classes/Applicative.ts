/**
 * https://dev.to/gcanti/getting-started-with-fp-ts-applicative-1kb3
 *
 * Applicative has the 'of' operation
 * which wraps a value
 */

import { flatten } from "fp-ts/lib/Array";
import { Option, some, none, isNone } from "fp-ts/lib/Option";
import { Task } from "fp-ts/lib/Task";
import { HKT } from "fp-ts/lib/HKT";
import { Apply } from "fp-ts/lib/Apply";

type Curried2<B, C, D> = (b: B) => (c: C) => D;
type Curried3<B, C, D, E> = (b: B) => (c: C) => (d: D) => E;

const applicativeArray = {
  map: <A, B>(fa: Array<A>, f: (a: A) => B): Array<B> => fa.map(f),
  of: <A>(a: A): Array<A> => [a],
  ap: <A, B>(fab: Array<(a: A) => B>, fa: Array<A>): Array<B> =>
    flatten(fab.map(f => fa.map(f)))
};

const applicativeOption = {
  map: <A, B>(fa: Option<A>, f: (a: A) => B): Option<B> =>
    isNone(fa) ? none : some(f(fa.value)),
  of: <A>(a: A): Option<A> => some(a),
  ap: <A, B>(fab: Option<(a: A) => B>, fa: Option<A>): Option<B> =>
    isNone(fab) ? none : applicativeOption.map(fa, fab.value)
};

const applicativeTask = {
  map: <A, B>(fa: Task<A>, f: (a: A) => B): Task<B> => () => fa().then(f),
  of: <A>(a: A): Task<A> => () => Promise.resolve(a),
  ap: <A, B>(fab: Task<(a: A) => B>, fa: Task<A>): Task<B> => () =>
    Promise.all([fab(), fa()]).then(([f, a]) => f(a))
};

function liftA2<F>(
  F: Apply<F>
): <B, C, D>(
  g: Curried2<B, C, D>
) => Curried2<HKT<F, B>, HKT<F, C>, HKT<F, D>> {
  return g => fb => fc => F.ap(F.map(fb, g), fc);
}

function liftA3<F>(
  F: Apply<F>
): <B, C, D, E>(
  g: Curried3<B, C, D, E>
) => Curried3<HKT<F, B>, HKT<F, C>, HKT<F, D>, HKT<F, E>> {
  return g => fb => fc => fd => F.ap(F.ap(F.map(fb, g), fc), fd);
}
