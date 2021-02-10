/**
 * https://dev.to/gcanti/getting-started-with-fp-ts-io-36p6
 *
 * IO isolates and calls attention to impure operations,
 * functions that produce side affects, or interact with external
 * state. IO assumes a synchronous opration that will not fail.
 *
 */
import { Option, fromNullable } from "fp-ts/lib/Option";
import { log } from "fp-ts/lib/Console";
import { getMonoid, IO, io } from "fp-ts/lib/IO";
import { fold, Monoid, monoidSum } from "fp-ts/lib/Monoid";
import { randomInt } from "fp-ts/lib/Random";

// import { log } from "./utils";
// const log = (s: unknown): IO<void> => () => console.log(s);

const querySelectorIO = (selector: string): IO<Node> => () =>
  document.querySelector(selector);

const getAppRootIO = querySelectorIO("#app");

log(getAppRootIO());

const now: IO<number> = () => new Date().getTime();

const random: IO<number> = () => Math.random();

const randomBool: IO<boolean> = io.map(random, n => n < 0.5);

const program: IO<void> = io.chain(randomBool, log);

program();

const getItem = (key: string): IO<Option<string>> => () =>
  fromNullable(localStorage.getItem(key));

const setItem = (key: string, value: string): IO<void> => () =>
  localStorage.setItem(key, value);

type Die = IO<number>;

const monoidDie: Monoid<Die> = getMonoid(monoidSum);

/** returns the sum of the roll of the dice */
const roll: (dice: Array<Die>) => IO<number> = fold(monoidDie);

const D1: Die = randomInt(1, 6);
const D2: Die = randomInt(1, 6);
const D3: Die = randomInt(1, 6);

const dice = [D1, D2, D3];

const withLogging = <A>(action: IO<A>): IO<A> =>
  io.chain(action, a => io.map(log(`Value is: ${a}`), () => a));

io.chain(roll(dice.map(withLogging)), result => log(`Result is: ${result}`))();
