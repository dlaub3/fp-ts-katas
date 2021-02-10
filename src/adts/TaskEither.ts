/**
 *
 * TaskEither is for **async** operations that may throw
 * https://gcanti.github.io/fp-ts/recipes/async.html
 *
 */

import { TaskEither, tryCatch, taskEither, chain } from "fp-ts/lib/TaskEither";
import { randomInt } from "fp-ts/lib/Random";
import { array } from "fp-ts/lib/Array";
import { API_OPTIONS, API_ROOT } from "../api";
import { log } from "../utils";

function makeGet(url: string): TaskEither<Error, string> {
  return tryCatch(
    () => fetch(url).then(res => res.text()),
    reason => new Error(String(reason))
  );
}

const url = API_ROOT + "/" + API_OPTIONS.people + "/";
const getRandomInt = (min: number, max: number) => randomInt(min, max)();
const get = (n: number) => makeGet(url + n);
const taskEithers = [get, get, get].map(g => g(getRandomInt(1, 20)));

const sequenceGet = array.sequence(taskEither)(taskEithers);

sequenceGet().then(log);
