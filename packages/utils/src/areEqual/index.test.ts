import { describe, expect, it } from "bun:test";
import { clone } from "../clone/index.ts";
import { areEqual } from "./index.ts";

describe("simple are equal test", () => {
  const original = {
    a: 1,
    b: "two",
    c: [1, 2, 3],
    d: { e: 1, f: 2 },
    e: new Date(),
    f: new Map([
      ["a", 1],
      ["b", 2]
    ]),
    g: new Set([1, 2, 3])
  };
  const cloned = clone(original);

  it("tests", () => {
    // They are not same instance
    expect(cloned === original).toBe(false);
    expect(cloned).not.toBe(original);

    // But they are equal
    expect(cloned).toEqual(original);
    expect(cloned).toMatchObject(original);
    expect(cloned).toStrictEqual(original);
    expect(JSON.stringify(cloned)).toBe(JSON.stringify(original));

    // And we can test it with areEqual
    expect(areEqual(cloned, original)).toBe(true);

    expect(areEqual(null, {})).toBe(false);
  });
});
