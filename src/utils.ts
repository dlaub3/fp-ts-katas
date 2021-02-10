export const { log, table } = console;

export const identity = <A extends unknown>(a: A) => a;

export const call = (fn: Function) => fn();

export const tap = <A extends unknown>(a: A) => {
  log(a);
  return a;
};

export const delay = (ms: number) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), ms);
  });
};
