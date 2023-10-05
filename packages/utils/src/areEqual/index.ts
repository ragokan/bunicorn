export function areEqual(a: any, b: any): boolean {
  try {
    if (a === b) {
      return true;
    }

    if (a instanceof Array && b instanceof Array) {
      if (a.length !== b.length) {
        return false;
      }
      for (let i = 0; i < a.length; i++) {
        if (!areEqual(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }

    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }

    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) {
        return false;
      }
      for (const [key, val] of a) {
        if (!b.has(key)) {
          return false;
        }
        if (!areEqual(val, b.get(key))) {
          return false;
        }
      }
      return true;
    }

    if (a instanceof Set && b instanceof Set) {
      if (a.size !== b.size) {
        return false;
      }
      return areEqual(Array.from(a.values()), Array.from(b.values()));
    }

    if (typeof a === "object" && typeof b === "object") {
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);
      if (aKeys.length !== bKeys.length) {
        return false;
      }
      for (const key of aKeys) {
        if (!areEqual(a[key], b[key])) {
          return false;
        }
      }
      return true;
    }

    if (typeof a === "function" && typeof b === "function") {
      return a.toString() === b.toString();
    }

    return false;
  } catch (error) {
    return false;
  }
}
