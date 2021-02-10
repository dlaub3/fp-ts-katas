/**
 * Task is like IO but it's intended for asynchronous affects
 * that don't throw
 *
 */

import { Task } from "fp-ts/lib/Task";
import { log } from "fp-ts/lib/Console";
import { delay } from "./utils";

const delayLog = (msg: string): Task<string> => () => {
  console.time("delay");
  const t1 = performance.now();
  return new Promise<string>(async resolve => {
    await delay(500);
    log(msg)();
    resolve(msg);
    console.timeEnd("delay");
    const t2 = performance.now();
    log(t2 - t1)();
  });
};

const delayLogHelloWorld = delayLog("Hello World!");
delayLogHelloWorld().then(msg => console.log("received the message"));
