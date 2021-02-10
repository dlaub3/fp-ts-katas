/**
 * https://dev.to/gcanti/getting-started-with-fp-ts-either-vs-validation-5eja
 */

import { Either, left, right, mapLeft, map } from "fp-ts/lib/Either";
import { chain } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { getSemigroup, NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { getValidation } from "fp-ts/lib/Either";
import { sequenceT } from "fp-ts/lib/Apply";

const minLength = (s: string): Either<string, string> =>
  s.length >= 6 ? right(s) : left("at least 6 characters");

const oneCapital = (s: string): Either<string, string> =>
  /[A-Z]/g.test(s) ? right(s) : left("at least one capital letter");

const oneNumber = (s: string): Either<string, string> =>
  /[0-9]/g.test(s) ? right(s) : left("at least one number");

const validatePasswordFailFast = (s: string): Either<string, string> =>
  pipe(
    minLength(s),
    chain(oneCapital),
    chain(oneNumber)
  );

function lift<E, A>(
  check: (a: A) => Either<E, A>
): (a: A) => Either<NonEmptyArray<E>, A> {
  return a =>
    pipe(
      check(a),
      mapLeft(a => [a])
    );
}

const minLengthV = lift(minLength);
const oneCapitalV = lift(oneCapital);
const oneNumberV = lift(oneNumber);

const applicativeValidation = getValidation(getSemigroup<string>());

function validatePassword(s: string): Either<NonEmptyArray<string>, string> {
  return pipe(
    sequenceT(applicativeValidation)(
      minLengthV(s),
      oneCapitalV(s),
      oneNumberV(s)
    ),
    map(() => s)
  );
}

console.log(validatePasswordFailFast("ab"));
console.log(validatePassword("ab"));

interface Person {
  name: string;
  age: number;
}

// Person constructor
const toPerson = ([name, age]: [string, number]): Person => ({
  name,
  age
});

const validateName = (s: string): Either<NonEmptyArray<string>, string> =>
  s.length === 0 ? left(["Invalid name"]) : right(s);

const validateAge = (s: string): Either<NonEmptyArray<string>, number> =>
  isNaN(+s) ? left(["Invalid age"]) : right(+s);

function validatePerson(
  name: string,
  age: string
): Either<NonEmptyArray<string>, Person> {
  return pipe(
    sequenceT(applicativeValidation)(validateName(name), validateAge(age)),
    map(toPerson)
  );
}

console.log(validatePerson("foo", "21"));
console.log(validatePerson("", ""));

/**
 * https://dev.to/gcanti/comment/ic3l
 * This is what sequenceT is doing under the hood
 *  (when specialized to getValidation(getSemigroup<string>()) + three validations)
 */

function specializedSequenceT(
  firstValidation: Either<NonEmptyArray<string>, string>,
  secondValidation: Either<NonEmptyArray<string>, string>,
  thirdValidation: Either<NonEmptyArray<string>, string>
): Either<NonEmptyArray<string>, [string, string, string]> {
  // Applicative instance for `Either<NonEmptyArray<string>, A>`
  const V = getValidation(getSemigroup<string>());

  // builds a tuple from three strings
  const tuple = (a: string) => (b: string) => (
    c: string
  ): [string, string, string] => [a, b, c];

  // manual lifting, check out the "Lifting" section in "Getting started with fp-ts: Applicative"

  const firstCheck = V.map(firstValidation, tuple);
  const secondCheck = V.ap(firstCheck, secondValidation);
  const thirdCheck = V.ap(secondCheck, thirdValidation);
  return thirdCheck;
}

function validatePasswordExmpl(
  s: string
): Either<NonEmptyArray<string>, string> {
  return pipe(
    specializedSequenceT(minLengthV(s), oneCapitalV(s), oneNumberV(s)),
    map(() => s)
  );
}

console.log(validatePasswordExmpl("fo"));
