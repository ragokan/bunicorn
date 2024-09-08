export type GetDependencyFn = <T>(dependency: Dependency<T>) => T;

export type __CreateFn<T> = (get: GetDependencyFn) => T;

export interface Dependency<T> {
	id: symbol;
	create: __CreateFn<T>;
}

export interface __DependencyStore {
	get: GetDependencyFn;
}

export type InferDependencyType<T> = T extends Dependency<infer U>
	? U extends Promise<infer V>
		? V
		: U
	: never;

export function dependency<T>(create: __CreateFn<T>): Dependency<T> {
	return {
		id: Symbol("Dependency ID"),
		create,
	};
}

// Recommended for internal usage only
export function __createDependencyStore(): __DependencyStore {
	const dependencies: Record<symbol, any> = {};

	function get<T>(dependency: Dependency<T>): T {
		return (dependencies[dependency.id] ??= dependency.create(get));
	}

	return { get };
}
