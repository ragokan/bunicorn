import { clone } from "./index.ts";

export function pick<T extends Record<any, any>, K extends (keyof T)[]>(
	source: T,
	...keys: K
) {
	const res: Partial<T> = {};
	for (const key of keys) {
		res[key] = source[key];
	}
	return res as Pick<T, K[number]>;
}

export function pickAndClone<T extends Record<any, any>, K extends (keyof T)[]>(
	source: T,
	...keys: K
) {
	return clone(pick(source, ...keys));
}
