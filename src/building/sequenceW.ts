import * as RD from "@devexperts/remote-data-ts";
import { HKT, Kind, Kind2, URIS, URIS2 } from "fp-ts/lib/HKT";
import { Apply2, Apply1, Apply, Apply2C, sequenceS } from "fp-ts/lib/Apply";

export type Values<T extends object> = T extends Record<
  string | number | symbol,
  infer A
>
  ? A
  : T extends Array<infer B>
  ? B
  : T extends Map<unknown, infer C>
  ? C
  : T extends WeakMap<object, infer D>
  ? D
  : T extends Set<infer E>
  ? E
  : T extends WeakSet<infer F>
  ? F
  : unknown;

declare type EnforceNonEmptyRecord<R> = keyof R extends never ? never : R;

export declare function sequenceSW<F extends Omit<URIS2, "Reader">>(
  F: Apply2<F>
): <NER extends Record<string, Kind2<F, any, any>>>(
  r: EnforceNonEmptyRecord<NER> & Record<string, Kind2<F, any, any>>
) => Kind2<
  F,
  Values<
    {
      [K in keyof NER]: [NER[K]] extends [Kind2<F, infer E, any>] ? E : never;
    }
  >,
  {
    [K in keyof NER]: [NER[K]] extends [Kind2<F, any, infer A>] ? A : never;
  }
>;

export declare function sequenceSW<F extends Omit<URIS2, "Reader">>(
  F: Apply2C<F, any>
): <NER extends Record<string, Kind2<F, any, any>>>(
  r: EnforceNonEmptyRecord<NER>
) => Kind2<
  F,
  Values<
    {
      [K in keyof NER]: [NER[K]] extends [Kind2<F, infer E, any>] ? E : never;
    }
  >,
  {
    [K in keyof NER]: [NER[K]] extends [Kind2<F, any, infer A>] ? A : never;
  }
>;

export declare function sequenceSW<F extends URIS>(
  F: Apply1<F>
): <NER extends Record<string, Kind<F, any>>>(
  r: EnforceNonEmptyRecord<NER>
) => Kind<
  F,
  {
    [K in keyof NER]: [NER[K]] extends [Kind<F, infer A>] ? A : never;
  }
>;
export declare function sequenceSW<F>(
  F: Apply<F>
): <NER extends Record<string, HKT<F, any>>>(
  r: EnforceNonEmptyRecord<NER>
) => HKT<
  F,
  {
    [K in keyof NER]: [NER[K]] extends [HKT<F, infer A>] ? A : never;
  }
>;

const rd1: RD.RemoteData<string, number> = RD.success(10);
const rd2: RD.RemoteData<
  { error: string; code: number },
  { bar: string }
> = RD.success({ bar: "bar" });

const s = sequenceS(RD.remoteData);
const sw = sequenceSW(RD.remoteData);

const x_s = s({ rd1, rd2: rd1 });
const x_sw = sw({ rd1, rd2 });
