export type GetDependencyFn = <T>(dependency: Dependency<T>) => T;

export type CreateFn<T> = (get: GetDependencyFn) => T;

export interface Dependency<T> {
  id: symbol;
  create: CreateFn<T>;
}

export interface DependencyStore {
  get: GetDependencyFn;
}

export function dependency<T>(create: CreateFn<T>): Dependency<T> {
  return {
    id: Symbol("Dependency ID"),
    create
  };
}

export function createDependencyStore(): DependencyStore {
  const dependencies: Record<symbol, any> = {};

  function get<T>(dependency: Dependency<T>): T {
    return (dependencies[dependency.id] ??= dependency.create(get));
  }

  return { get };
}
