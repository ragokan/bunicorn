import { describe, it, expect } from "bun:test";
import { mutate } from "./index.js";

describe("simple mutate test", () => {
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

  it("tests primitive type", () => {
    const updatedItem = mutate(original, t => {
      t.a = 2;
    });
    expect(original.a).toEqual(1);
    expect(updatedItem.a).toEqual(2);
  });

  it("tests array type", () => {
    const updatedItem = mutate(original, t => {
      t.c.push(4);
    });
    expect(original.c.length).toEqual(3);
    expect(updatedItem.c.length).toEqual(4);
    expect(updatedItem.c[3]).toEqual(4);
    expect(updatedItem.c).not.toBe(original.c);
  });
});
