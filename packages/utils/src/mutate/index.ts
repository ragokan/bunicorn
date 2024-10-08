import { clone } from "../index.ts";

export function mutate<V extends object, R>(value: V, mutator: (v: V) => R) {
	const c = clone(value);
	mutator(c);
	return c;
}
