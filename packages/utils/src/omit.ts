import { clone } from "./index.js";
import { type DeepKey, deepDelete } from "./deepObject.js";

export function omit<T extends Record<any, any>, K extends (keyof T)[]>(
  source: T,
  ...keys: K
) {
  const result: Record<any, any> = {};
  Object.entries(source).forEach(([key, value]) => {
    if (!keys.includes(key)) {
      result[key] = value;
    }
  });
  return result as Omit<T, K[number]>;
}

export function omitAndClone<T extends Record<any, any>, K extends (keyof T)[]>(
  source: T,
  ...keys: K
) {
  return clone(omit(source, ...keys));
}

export function omitDeep<
  T extends Record<any, any>,
  K extends DeepKey<T, keyof T>[]
>(source: T, ...keys: K) {
  const cloned = clone(source);
  for (const key of keys) {
    deepDelete(cloned, key);
  }
  return cloned as Omit<T, K[number]>;
}
