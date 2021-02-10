import * as RTE from "fp-ts/lib/ReaderTaskEither";
import * as IO from "fp-ts/lib/IO";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";

// TS isn't picking up the DOM types :(
type RequestInfo = any;
type RequestInit = any;

// Error types
type HttpRequestError = {
  tag: "httpRequestError";
  error: unknown;
};

type HttpContentTypeError = {
  tag: "httpContentTypeError";
  error: unknown;
};

type HttpResponseStatusError = {
  tag: "httpResponseStatusError";
  status: number;
};

// Interface
interface HttpClient {
  request(
    input: RequestInfo,
    init?: RequestInit
  ): TE.TaskEither<HttpRequestError, Response>;
}

// RTE "module" interface - for composing with other dependencies
export interface HttpClientEnv {
  httpClient: HttpClient;
}

export interface Storage {
  getItem(key: string): IO.IO<O.Option<string>>;
  setItem(key: string, value: string): IO.IO<void>;
}

interface StorageEnv {
  storage: Storage;
}

// "Live" implementation backed by `fetch`
const fetchHttpClient: HttpClient = {
  request: (input, init) =>
    TE.tryCatch(
      () => {
        return fetch(input, init);
      },
      (e: any) => ({
        tag: "httpRequestError",
        error: e
      })
    )
};

export const domStorage: Storage = {
  getItem: (key: string) => () => O.fromNullable(localStorage.getItem(key)),
  setItem: (key: string, value: string) => () => {
    localStorage.setItem(key, value);
  }
};

export const httpClientEnv: HttpClientEnv = { httpClient: fetchHttpClient };

const storageEnv: StorageEnv = { storage: domStorage };

type AppEnv = HttpClientEnv & StorageEnv; // & other envs types

const appEnv: AppEnv = { ...httpClientEnv, ...storageEnv /* ...other impls */ }; // { httpClient, storage, ... }

export const request = (
  input: RequestInfo,
  init?: RequestInit
): RTE.ReaderTaskEither<HttpClientEnv, HttpRequestError, Response> =>
  pipe(
    RTE.asks<HttpClientEnv, never, HttpClient>(
      (env: HttpClientEnv) => env.httpClient
    ),
    RTE.chainTaskEitherKW((httpClient: HttpClient) =>
      httpClient.request(input, init)
    )
  );

// Helper for extracting `json` response into `unknown` for decoding
export const toJson = (
  response: Response
): TE.TaskEither<HttpContentTypeError, unknown> =>
  TE.tryCatch(
    () => response.json(),
    (e: any) => ({ tag: "httpContentTypeError", error: e })
  );

// Helper for validating response status
export const ensureStatus = (min: number, max: number) => (
  response: Response
): E.Either<HttpResponseStatusError, Response> =>
  min <= response.status && response.status < max
    ? E.right(response)
    : E.left({ tag: "httpResponseStatusError", status: response.status });

export const breedsCodec = t.type({
  message: t.record(t.string, t.array(t.string))
});

// "High-level" helper for issuing a simple GET to a JSON endpoint
export const getJson = <A, DecodeError>(
  url: string,
  decode: (raw: unknown) => E.Either<DecodeError, A>
) =>
  pipe(
    RTE.asks<HttpClientEnv, never, HttpClient>(
      (env: HttpClientEnv) => env.httpClient
    ),
    RTE.chainTaskEitherK((httpClient: HttpClient) => httpClient.request(url)),
    RTE.chainEitherKW(ensureStatus(200, 300)), // ensureStatus operates on Either, so lift it (and widen error type) with chainEitherKW
    RTE.chainTaskEitherKW(toJson), // toJson operates on TaskEither, so lift into RTE (with widening)
    RTE.chainEitherKW(decode) // decode operates on Either... same deal
  );

export const getWithCache = <A, RGet, EGet>(
  key: string,
  codec: t.Type<A>,
  get: RTE.ReaderTaskEither<RGet, EGet, A>
): RTE.ReaderTaskEither<StorageEnv & RGet, EGet | t.Errors, A> =>
  pipe(
    // Get the Storage service from the Reader
    // Side note: rather than `ask` here, we could have used an "RTE helper function" below that has a dependency on `StorageEnv`
    RTE.asks<StorageEnv, never, Storage>((env) => env.storage),
    RTE.chainW((storage) =>
      pipe(
        // Try to get the item from the cache
        RTE.fromIO<unknown, never, O.Option<string>>(storage.getItem(key)),
        RTE.chainW((strOpt: O.Option<string>) =>
          pipe(
            strOpt,
            O.fold<string, RTE.ReaderTaskEither<RGet, EGet | t.Errors, A>>(
              () =>
                // Cache miss - make the get call and cache the result
                pipe(
                  get,
                  RTE.chainW((a: A) =>
                    pipe(
                      a, // A
                      codec.encode, // unknown
                      JSON.stringify, // string
                      (str) =>
                        RTE.fromIO<unknown, never, void>(
                          storage.setItem(key, str)
                        ),
                      RTE.map((_) => a)
                    )
                  )
                ),
              (str) =>
                // Cache hit - parse and decode the item and return it
                pipe(
                  str, // string
                  JSON.parse, // unknown
                  codec.decode, // A
                  RTE.fromEither
                )
            )
          )
        )
      )
    )
  );

type Breeds = t.TypeOf<typeof breedsCodec>;

// Get breeds via the HTTP API
export const getBreeds: RTE.ReaderTaskEither<
  HttpClientEnv,
  HttpRequestError | HttpContentTypeError | HttpResponseStatusError | t.Errors,
  Breeds
> = getJson("https://dog.ceo/api/breeds/list/all", breedsCodec.decode);

// Add the cached version
export const getBreedsWithCache: RTE.ReaderTaskEither<
  HttpClientEnv & StorageEnv,
  HttpRequestError | HttpContentTypeError | HttpResponseStatusError | t.Errors,
  Breeds
> = getWithCache("breeds", breedsCodec, getBreeds);

console.log("now");
console.log(pipe(httpClientEnv, getBreeds));
