/**
 * Tagless Final: A technique that allows reusing code accross ADTs
 * using higher kinded types
 *
 * https://dev.to/gcanti/functional-design-tagless-final-332k
 *
 */

import { URI as URIIO, io, IO } from "fp-ts/lib/IO";
import { identity } from "fp-ts/lib/function";
import { URI as URITask, task, fromIO } from "fp-ts/lib/Task";
import { Monad1 } from "fp-ts/lib/Monad";
import { Kind, URIS } from "fp-ts/lib/HKT";
import * as D from "fp-ts/lib/Date";

export interface MonadIO<M extends URIS> extends Monad1<M> {
  readonly fromIO: <A>(fa: IO<A>) => Kind<M, A>;
}

const monadIOTask: MonadIO<URITask> = {
  ...task,
  fromIO: fromIO
};

export const monadIOIO: MonadIO<URIIO> = {
  ...io,
  fromIO: identity
};

export function time<M extends URIS>(
  M: MonadIO<M>
): <A>(ma: Kind<M, A>) => Kind<M, [A, number]> {
  const now = M.fromIO(D.now); // lifting
  return ma =>
    M.chain(now, start =>
      M.chain(ma, a => M.map(now, end => [a, end - start]))
    );
}

/**
 * This technique is used throughout FP-TS
 */

// timeIO: <A>(ma: IO<A>) => IO<[A, number]>
const timeIO = time(monadIOIO);

// timeTask: <A>(ma: Task<A>) => Task<[A, number]>
const timeTask = time(monadIOTask);
