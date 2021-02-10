import * as monocle from "monocle-ts";
import * as R from "fp-ts/lib/Record";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as RD from "@devexperts/remote-data-ts";
import { lookup } from "fp-ts/lib/ReadonlyRecord";
import * as Tr from "fp-ts/lib/Traversable";

const { log } = console;

/**
 * Functional Optics
 *
 * https://gcanti.github.io/monocle-ts/
 *
 * https://www.scala-exercises.org/monocle/iso
 *
 * https://scalac.io/scala-optics-lenses-with-monocle/
 *
 * https://www.optics.dev/Monocle/docs/optics (optic composition table)
 *
 */

/**
 * Lense
 *
 * Use for setters and getters for values
 * that are not optional
 *
 */

type FunkyAddress = {
  country: {
    USA: {
      State: {
        PA: {
          City: {
            Waterville: {
              address: "10 Main St";
            };
          };
        };
      };
    };
  };
};

const cityL = monocle.Lens.fromPath<FunkyAddress>()([
  "country",
  "USA",
  "State",
  "PA",
  "City"
]);

const addressL = monocle.Lens.fromProp<
  FunkyAddress["country"]["USA"]["State"]["PA"]["City"]
>()("Waterville");

const modifyAddress = cityL
  .composeLens(addressL)
  .modify((addr) => ({ address: "10 Main St" }));

/**
 * Prism
 *
 * A Prism is used to select part of a sum type
 * It provides a setter/getter for the sum type
 *
 */

const userPermissionsA: RD.RemoteData<{}, { isAdmin: boolean }> = RD.failure(
  {}
);

const userPermissionsB: RD.RemoteData<{}, { isAdmin: boolean }> = RD.success({
  isAdmin: false
});

const getRdPrism = <A, B>() => {
  return new monocle.Prism(
    function getOption(s: RD.RemoteData<A, B>) {
      return RD.toOption(s);
    },
    function reverseGet(data: B) {
      return RD.success(data);
    }
  );
};

const isAdminPrism = getRdPrism<{}, { isAdmin: boolean }>();

const isAdmin = isAdminPrism.modify((perms) =>
  perms.isAdmin ? { isAdmin: true } : { isAdmin: false }
);

/**
 * ISO
 *
 * Provides two way conversion between types
 */
type User = { name: string; age: number };
type Admin = User & { isAdmin: true };

const userAdminIso = new monocle.Iso<Admin, User>(
  function get(a) {
    return ["name", "age"].reduce(
      (acc, cur) => ({ ...acc, cur: a[cur] }),
      {} as User
    );
  },
  function reverseGet(u) {
    return { ...u, isAdmin: true };
  }
);

const user = { name: "Bob", age: 39 };

const bobTheAdmin = userAdminIso.wrap(user);

/**
 * Optional
 *
 * setters and getters for optional values
 *
 */

type ShoesAreOptional = {
  shirt: string;
  pants: string;
  shoes?: string;
};

const optionalShoes = new monocle.Optional<ShoesAreOptional, string>(
  function getOption(s) {
    return R.lookup("shoes", s);
  },
  function set(shoes) {
    return (clothing) => ({ ...clothing, shoes });
  }
);

const clothes = { pants: "blue jean", shirt: "t-shirt" };

const myShoes = optionalShoes.getOption(clothes);

/**
 * Traversal
 *
 *
 > A Traversal is the generalisation of an Optional to several targets. In other word, a Traversal allows to focus from a type S into 0 to n values of type A.
 > The most common example of a Traversal would be to focus into all elements inside of a container (e.g. List, Vector, Option). To do this we will use the relation between the typeclass cats.Traverse and Traversal:
 * 
 * 
 */

const listA = [O.none, O.some("A"), O.some("A")];
type Dat = { foo?: string; bar: number };

const listB: Array<Dat> = [
  { foo: "foo", bar: 10 },
  { foo: undefined, bar: 10 }
];

const arrayTraversal = monocle.fromTraversable(A.array);

const listA2 = arrayTraversal().modify((x: O.Option<string>) =>
  O.isNone(x) ? O.some("PREV: NONE") : O.some("PREV: SOME")
)(listA);

log(listA2);
