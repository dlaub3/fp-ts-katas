import * as iots from "io-ts";
import * as optics from "monocle-ts";
import * as A from "fp-ts/lib/Array";
import * as either from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
import { fromNewtype, getLenses } from "io-ts-types";
import { Newtype, iso } from "newtype-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { NonEmptyString } from "newtype-ts/lib/NonEmptyString";
import { Integer } from "newtype-ts/lib/Integer";

/**
 * https://gcanti.github.io/io-ts/
 *
 * Runtime type checking
 * - encode
 * - decode
 * - type guards with 'is'
 */

type User = {
  name: NonEmptyString;
  age: Integer;
};

type Admin = Newtype<"ADMIN", User>;

const adminIso = iso<Admin>();
const intergerIso = iso<Integer>();
const nonEmptyStringIso = iso<NonEmptyString>();
const nameL = optics.Lens.fromProp<{ name: string; age: number }>()("name");

const userCProps = {
  name: fromNewtype<NonEmptyString>(iots.string),
  age: fromNewtype<Integer>(iots.number)
};

const UserC = iots.type({ user: iots.type(userCProps) });
const AdminC = iots.type({ admin: iots.type(userCProps) });

const userLenses = getLenses(UserC);
const adminLenses = getLenses(AdminC);

const userData = { name: "Bob", age: 39 };

const fromUser = (u: User) => {
  return {
    name: nonEmptyStringIso.unwrap(u.name),
    age: intergerIso.unwrap(u.age)
  };
};

const toUser = (u: { name: string; age: number }): User => {
  return {
    name: nonEmptyStringIso.wrap(u.name),
    age: intergerIso.wrap(u.age)
  };
};

// User is NOT a NewType
const userIso = new optics.Iso(fromUser, toUser);
const user = userIso.wrap({ name: "asdf", age: 12 });
const nonUser = userIso.unwrap(user);

const adminFromIso = adminIso.wrap(userIso.wrap(userData));
const adminFromLens = adminLenses.admin.set(user);

// Application

// util
let count = 0;
const makeUser = (c) => {
  return { name: `name-` + c, age: c + 20 };
};

// api
const dataFromServer: Array<{ user: { name: string; age: number } }> = [
  ...Array(20)
    .fill("")
    .map(() => ({ user: makeUser(++count) })),
  ({ name: "name", age: 0 } as any) as { user: { name: string; age: number } }
];

const sanitized = pipe(
  dataFromServer.map(UserC.decode),
  A.separate,
  ({ right, left }) => {
    console.log(left.map((e) => PathReporter.report(either.left(e))));

    return right;
  }
);

// store validated values
const store = { users: sanitized };

// modify store
store.users = store.users.map(
  userLenses.user
    .composeIso(userIso)
    .composeLens(nameL)
    .modify((name) => name.toUpperCase())
);

// render
document.getElementById("app").innerHTML = `
<h1>Users:</h1>
<main>
  <ul>
    ${store.users.reduce((acc, u) => {
      return acc + `<li>${u.user.name} : ${u.user.age}</li>`;
    }, "")}
  </ul>
</main>
`;
