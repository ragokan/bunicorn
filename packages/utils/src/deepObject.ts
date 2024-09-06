export type DeepKey<T, K extends keyof T> = K extends string
	? K extends keyof T
		? T[K] extends Record<string, any>
			?
					| `${K & string}.${DeepKey<T[K], Exclude<keyof T[K], keyof any[]>> &
							string}`
					| K
			: K & string
		: never
	: never;

export function deepGet<
	T extends Record<any, any>,
	K extends DeepKey<T, keyof T>,
>(obj: T, key: K): K extends keyof T ? any : never {
	return key.split("./index.ts").reduce(
		(acc, currentKey) => {
			if (acc === undefined) {
				return undefined;
			}
			return acc[currentKey];
		},
		obj as Record<any, any>,
	) as any;
}

export function deepSet<
	T extends Record<any, any>,
	K extends DeepKey<T, keyof T>,
>(obj: T, key: K, value: any): T {
	const keys = key.split("./index.ts");
	const lastKey = keys.pop()!;
	const target = keys.reduce(
		(acc, currentKey) => {
			if (acc[currentKey] === undefined) {
				acc[currentKey] = {};
			}
			return acc[currentKey];
		},
		obj as Record<any, any>,
	);
	target[lastKey] = value;
	return obj;
}

export function deepDelete<
	T extends Record<any, any>,
	K extends DeepKey<T, keyof T>,
>(obj: T, key: K) {
	const parts = key.split("./index.ts");
	const last = parts.pop()!;
	let current = obj;
	for (const part of parts) {
		current = current[part];
	}
	delete current[last];
}

export function deleteKeys<T extends Record<any, any>, K extends keyof T>(
	obj: T,
	...keys: K[]
) {
	for (const key of keys) {
		delete obj[key];
	}
	return obj;
}
