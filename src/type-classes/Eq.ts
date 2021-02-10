import { Eq, eqNumber, getStructEq } from "fp-ts/lib/Eq";
import { log } from "fp-ts/lib/Console";
import { pipe } from "fp-ts/lib/pipeable";

/**
 * https://dev.to/gcanti/getting-started-with-fp-ts-setoid-39f3
 * 
 * Instances must satisfy the following laws:

    Reflexivity: equals(x, x) === true, for all x in A
    Symmetry: equals(x, y) === equals(y, x), for all x, y in A
    Transitivity: if equals(x, y) === true and equals(y, z) === true, then equals(x, z) === true, for all x, y, z in A

 */

function contains<A>(E: Eq<A>): (a: A, as: Array<A>) => boolean {
  return (a, as) => as.some(item => E.equals(item, a));
}

const containsNumber = contains(eqNumber);

pipe(
  containsNumber(1, [1, 2, 3]),
  log
);

const eqPoint = getStructEq({ x: eqNumber, y: eqNumber });

pipe(
  eqPoint.equals({ x: 1, y: 2 }, { x: 1, y: 2 }),
  log
);
