/**
 * Either is good for working with synchronous operations that
 * may fail
 */

import { Either, tryCatch, fold } from "fp-ts/lib/Either";
import { tap, log, identity } from "./utils";

function parse(s: string): Either<Error, unknown> {
  return tryCatch(() => JSON.parse(s), reason => new Error(String(reason)));
}

const e1 = parse("foo");
const e2 = parse('{"a": "FOO"}');
const e3 = parse("{a: 1,}");

const ex = [e1, e2, e3];

ex.map(fold((e: Error) => log(identity(e).message), log));
