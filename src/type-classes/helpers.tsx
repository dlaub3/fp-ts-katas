import React from "react";

import { URIS, HKT, Kind, Kind2, URIS2 } from "fp-ts/lib/HKT";
import { Functor, Functor1, Functor2 } from "fp-ts/lib/Functor";
import { Alternative1, Alternative2 } from "fp-ts/lib/Alternative";
import { Compactable1, Compactable2, Separated } from "fp-ts/lib/Compactable";
import { Either, stringifyJSON } from "fp-ts/lib/Either";
import { Eq } from "fp-ts/lib/Eq";
import { Extend1, Extend2 } from "fp-ts/lib/Extend";
import { Filterable1, Filterable2 } from "fp-ts/lib/Filterable";
import { Foldable1, Foldable2, Foldable } from "fp-ts/lib/Foldable";
import { Lazy, Predicate, Refinement } from "fp-ts/lib/function";
import { Monad1, Monad2 } from "fp-ts/lib/Monad";
import { MonadThrow1, MonadThrow2 } from "fp-ts/lib/MonadThrow";
import { Monoid } from "fp-ts/lib/Monoid";
import { Ord } from "fp-ts/lib/Ord";
import { Semigroup } from "fp-ts/lib/Semigroup";
import { Show } from "fp-ts/lib/Show";
import { Traversable1, Traversable2 } from "fp-ts/lib/Traversable";
import { Witherable1, Witherable2 } from "fp-ts/lib/Witherable";

import * as O from "fp-ts/lib/Option";
import * as RD from "@devexperts/remote-data-ts";

export function lift<F extends URIS2>(
  F: Functor2<F>
): <E, A, B>(f: (a: A) => B) => (fa: Kind2<F, E, A>) => Kind2<F, E, B>;

export function lift<F extends URIS>(
  F: Functor1<F>
): <A, B>(f: (a: A) => B) => (fa: Kind<F, A>) => Kind<F, B>;

export function lift<F>(
  F: Functor<F>
): <A, B>(f: (a: A) => B) => (fa: HKT<F, A>) => HKT<F, B> {
  return f => fa => F.map(fa, f);
}

export function map<F extends URIS2>(
  F: Functor2<F>
): <E, A, B>(fa: Kind2<F, E, A>, f: (a: A) => B) => Kind2<F, E, B>;

export function map<F extends URIS>(
  F: Functor1<F>
): <A, B>(fa: Kind<F, A>, f: (a: A) => B) => Kind<F, B>;

export function map<F>(
  F: Functor<F>
): <A, B>(fa: HKT<F, A>, f: (a: A) => B) => HKT<F, B> {
  return (fa, f) => F.map(fa, f);
}

type API1<URI extends URIS> = Monad1<URI> &
  Foldable1<URI> &
  Traversable1<URI> &
  Alternative1<URI> &
  Extend1<URI>;

type API2<URI extends URIS2> = Monad2<URI> &
  Foldable2<URI> &
  Traversable2<URI> &
  Alternative2<URI> &
  Extend2<URI>;

interface Selectable1<URI extends URIS, T> {
  api: API1<URI>;
  getId: (d: T) => string;
  compare: (d: T, s: string) => boolean;
  data: Kind<URI, Array<T>>;
}

interface Selectable2<URI extends URIS2, A, B> {
  api: API2<URI>;
  getId: (d: A) => string;
  compare: (d: A, s: string) => boolean;
  data: Kind2<URI, Array<A>, B>;
}

function useSelectable<URI extends URIS, A>(props: Selectable1<URI, A>);
function useSelectable<URI extends URIS2, A, B>(props: Selectable2<URI, A, B>);
function useSelectable(props) {
  const totalItems = map(props.api)(props.data, xs => {
    const id = props.getId(xs[0]);
  });

  return totalItems;
}

export const Test1 = () => {
  const x = useSelectable<"RemoteData", { id: string; name: string }, {}>({
    api: RD.remoteData,
    data: RD.success([{ id: "foo", name: "bar" }]),
    getId: d => d.id,
    compare: d => true
  });

  return <div>{x}</div>;
};

// export const Test2 = () => {
//   const [searchText, setSearchText] = React.useState("");
//   const adt: any = useSelectable({ searchText, ...otherProps });

//   return (
//     <>
//       <SearchComponent />
//       {fold(adt)((props: { selected; toggleSelected; total; visible }) => {
//         <ReactTable {...props} />;
//       })}
//     </>
//   );
// };
