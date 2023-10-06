import { areEqual } from "./index.js";

export function partialEqual(a: any, b: any) {
  if (a === b) {
    return true;
  }

  try {
    for (const key in a as Record<any, any>) {
      if (!areEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  } catch (_) {
    return false;
  }
}
