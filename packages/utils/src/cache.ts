import { areEqual } from "./index.js";

type ArgsType<T> = T extends (...args: infer U) => unknown
  ? U extends Promise<infer Y>
    ? Y
    : U
  : never;

/**
 * Cache your function, when called with same arguments, it will return the cached result. If you want to bypass the cache, pass true as second argument.
 *
 * @export
 * @template T
 * @param {T} fn Function to cache
 * @param {boolean} [bypass=false] Defaults to false, if set to true, it won't read from cache and update it
 * @returns {T}
 */
export function cache<T extends (...args: any[]) => any>(
  fn: T,
  bypass: boolean = false
): T {
  const results = new Map<ArgsType<T>, ReturnType<T>>();
  return ((...args: ArgsType<T>) => {
    if (!bypass) {
      for (const [key, value] of results.entries()) {
        if (areEqual(key, args)) {
          return value;
        }
      }
    }
    const result = fn(...args);
    results.set(args, result);
    return result;
  }) as T;
}
