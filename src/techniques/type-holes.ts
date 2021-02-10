/**
 * https://dev.to/gcanti/type-holes-in-typescript-2lck
 *
 * Type Holes: not really supported in typescript.
 * The idea is to allow the type system to guide you
 * into implementing a function
 */

declare function _<T>(): T;

function jonk<A, B>(
  ab: (a: A) => B,
  ann: (an: (a: A) => number) => number
): (bn: (b: B) => number) => number {
  return bn => _(); // The type system infers the type here and we can use that to guid our implementation.
}
