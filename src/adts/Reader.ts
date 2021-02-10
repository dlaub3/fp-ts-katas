/**
 * https://dev.to/gcanti/getting-started-with-fp-ts-reader-1ie5
 *
 * Reader: The purpose of the Reader monad is to avoid threading arguments
 * through multiple functions in order to only get them where they are needed.
 *
 * One of the ideas presented here is to use the Reader monad for dependency injection.
 */
import { pipe } from "fp-ts/lib/pipeable";
import { ask, chain, Reader, map } from "fp-ts/lib/Reader";
import { flow } from "fp-ts/lib/function";

export interface Dependencies {
  i18n: {
    true: string;
    false: string;
  };
  lowerBound: number;
}

const instance: Dependencies = {
  i18n: {
    true: "vero",
    false: "falso"
  },
  lowerBound: 2
};

const f = (b: boolean): string => (b ? "true" : "false");
// const f = (b: boolean, deps: Dependencies): string =>
//   b ? deps.i18n.true : deps.i18n.false; // This creates a dependecy dependency, the dependencies need to be
// passed through all functions

const g = (n: number): string => f(n > 2);

const h = (s: string): string => g(s.length + 1);

console.log(h("foo")); // 'true'

const fd = (b: boolean): Reader<Dependencies, string> => deps =>
  b ? deps.i18n.true : deps.i18n.false;

const gd = (n: number): Reader<Dependencies, string> =>
  pipe(
    ask<Dependencies>(),
    chain(deps => fd(n > deps.lowerBound))
  );

const hd = (s: string): Reader<Dependencies, string> => gd(s.length + 1);

console.log(hd("foo")(instance)); // 'vero'
console.log(hd("foo")({ ...instance, lowerBound: 4 })); // 'falso'

const len = (s: string): number => s.length;
const double = (n: number): number => n * 2;
const gt2 = (n: number): boolean => n > 2;

const compositionF = flow(
  len,
  double,
  gt2
);
// equivalent to
// Reader's map is (the usual) function composition
const compositionP = pipe(
  len,
  map(double),
  map(gt2)
);
