export function clone<T extends object>(obj: T): T {
  const result: any = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    const val = obj[key];

    // Catch falsy values like null and undefined
    if (!val) {
      result[key] = val;
      continue;
    }

    // Catch Array
    if (val instanceof Array) {
      result[key] = val.map(item =>
        typeof item === "object" ? clone(item) : item
      );
      continue;
    }

    // Catch Date
    if (val instanceof Date) {
      result[key] = new Date(val);
      continue;
    }

    // Catch Map
    if (val instanceof Map) {
      result[key] = new Map(clone(Array.from(val.entries())));
      continue;
    }

    // Catch Set
    if (val instanceof Set) {
      result[key] = new Set(clone(Array.from(val.values())));
      continue;
    }

    // Go Objects
    if (typeof val === "object") {
      result[key] = clone(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}
