import type { BunicornContext } from "../context/base.ts";
import type { BasePath } from "../router/types.ts";

export type BaseMiddleware<TPath extends BasePath = BasePath, TResult = any> = (
	ctx: BunicornContext<TPath>,
	next: () => Promise<Response>,
) => TResult | Promise<TResult>;

export function createMiddleware<TResult>(
	cb: (ctx: BunicornContext, next: () => Promise<Response>) => TResult,
) {
	return cb;
}
