/**
 *
 * https://dev.to/gcanti/getting-started-with-fp-ts-io-36p6
 *
 * IOEither
 *
 * A  **synchronous** IO impure function that may throw
 *
 */

// import { IO } from "fp-ts/lib/IO";
import { IOEither, tryCatch, fold } from "fp-ts/lib/IOEither";
import { tap, log, identity } from "../utils";
import { pipe } from "fp-ts/lib/pipeable";
import { toError } from "fp-ts/lib/Either";

const container = {
  a: "a",
  b: "b",
  c: "c",
  d: "d,",
  *[Symbol.iterator]() {
    for (let k in this) {
      yield this[k];
    }
  }
};

function* iterateToJSON(obj: Iterable<{}>) {
  for (let k of container) {
    yield JSON.parse(k);
  }
}

function getAsJSON(obj: Iterable<{}>): IOEither<Error, JSON[]> {
  return tryCatch(
    () => [...iterateToJSON(obj)],
    (reason: Error) => Error(reason.message)
  );
}

log(
  pipe(
    getAsJSON(container),
    fold((e: Error) => () => e.message, (v: JSON[]) => () => identity(v).join())
  )()
);
