/**
 * Option/Maybe is great for working with non-functional code
 * it handled null/undefined values by convertingthem to a none/left
 *
 */

import { Option, some, none, map, fromNullable } from "fp-ts/lib/Option";
import { tap } from "./utils";

function findIndex<A>(
  as: Array<A>,
  predicate: (a: A) => boolean
): Option<number> {
  const index = as.findIndex(predicate);
  return index === -1 ? none : some(index);
}

function find<A>(as: Array<A>, predicate: (a: A) => boolean): Option<A> {
  return fromNullable(as.find(predicate));
}

const xa = ["a", "b", 1, { b: 23 }, "foo"];

const idx = findIndex(xa, (el: unknown) => el === 1);

map(tap)(idx);

const item = find(xa, (el: unknown) => el === 1);

map(tap)(item);
