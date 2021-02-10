import { Ord, min, max, ordNumber } from "fp-ts/lib/Ord";
import { log } from "fp-ts/lib/Console";
import { pipe } from "fp-ts/lib/pipeable";
import { contramap } from "fp-ts/lib/Ord";

/**
 * https://dev.to/gcanti/getting-started-with-fp-ts-ord-5f1e
 * 
 * 
    Reflexivity: compare(x, x) === 0, for all x in A
    Antisymmetry: if compare(x, y) <= 0 and compare(y, x) <= 0 then x is equal to y, for all x, y in A
    Transitivity: if compare(x, y) <= 0 and compare(y, z) <= 0 then compare(x, z) <= 0, for all x, y, z in A

 */

pipe(
  ordNumber.compare(1, 3),
  log
)();

pipe(
  max(ordNumber)(1, 3),
  log
)();

type User = {
  name: string;
  age: number;
};

// const byAge: Ord<User> = fromCompare((x, y) => ordNumber.compare(x.age, y.age));
const byAge: Ord<User> = contramap((user: User) => user.age)(ordNumber);

pipe(
  byAge.compare({ name: "Guido", age: 48 }, { name: "Giulio", age: 45 }),
  log
)();

const getYounger = min(byAge);

pipe(
  getYounger({ name: "Guido", age: 48 }, { name: "Giulio", age: 45 }),
  log
)();
