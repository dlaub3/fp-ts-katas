import {
  monoidProduct,
  monoidString,
  monoidSum,
  monoidAny,
  monoidAll,
  Monoid,
  fold,
  getStructMonoid
} from "fp-ts/lib/Monoid";
import { log } from "fp-ts/lib/Console";
import { pipe } from "fp-ts/lib/pipeable";
import {
  getApplyMonoid,
  getLastMonoid,
  some,
  Option,
  none,
  ap
} from "fp-ts/lib/Option";

/**
 * https://dev.to/gcanti/getting-started-with-fp-ts-monoid-ja0
 *
 * A Monoid is any Semigroup that happens to have a special value which is "neutral" with respect to concat.
 * 
 *
    Right identity: concat(x, empty) = x, for all x in A
    Left identity: concat(empty, x) = x, for all x in A
 *
 */

const n = ap(some(10))(some((v: number) => v + 10));

console.log(getApplyMonoid(monoidProduct).concat(n, n));
console.log(getApplyMonoid(monoidSum).concat(n, n));

type Point = {
  x: number;
  y: number;
};

const monoidPoint: Monoid<Point> = getStructMonoid({
  x: monoidSum,
  y: monoidSum
});

type Vector = {
  from: Point;
  to: Point;
};

const monoidVector: Monoid<Vector> = getStructMonoid({
  from: monoidPoint,
  to: monoidPoint
});

pipe(
  fold(monoidVector)([
    { from: { x: 1, y: 2 }, to: { x: 2, y: 4 } },
    { from: { x: 7, y: 2 }, to: { x: 4, y: 6 } }
  ]),
  log
)();

/**
 *
 * When using a monoid instead of a semigroup,
 * folding is even simpler: we don't need to explicitly provide an
 * initial value (the implementation can use the monoid's empty value for that)
 *
 */

fold(monoidSum)([1, 2, 3, 4]); // 10
fold(monoidProduct)([1, 2, 3, 4]); // 24
fold(monoidString)(["a", "b", "c"]); // 'abc'
fold(monoidAll)([true, false, true]); // false
fold(monoidAny)([true, false, true]); // true

const M = getApplyMonoid(monoidSum);

M.concat(some(1), none); // none
M.concat(some(1), some(2)); // some(3)
M.concat(some(1), M.empty); // some(1)

/** VSCode settings */
interface Settings {
  /** Controls the font family */
  fontFamily: Option<string>;
  /** Controls the font size in pixels */
  fontSize: Option<number>;
  /** Limit the width of the minimap to render at most a certain number of columns. */
  maxColumn: Option<number>;
}

const monoidSettings: Monoid<Settings> = getStructMonoid({
  fontFamily: getLastMonoid<string>(),
  fontSize: getLastMonoid<number>(),
  maxColumn: getLastMonoid<number>()
});

const workspaceSettings: Settings = {
  fontFamily: some("Courier"),
  fontSize: none,
  maxColumn: some(80)
};

const userSettings: Settings = {
  fontFamily: some("Fira Code"),
  fontSize: some(12),
  maxColumn: none
};

/** userSettings overrides workspaceSettings */
monoidSettings.concat(workspaceSettings, userSettings);
/*
{ fontFamily: some("Fira Code"),
  fontSize: some(12),
  maxColumn: some(80) }
*/
