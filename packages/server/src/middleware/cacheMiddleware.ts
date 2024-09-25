import type { BunicornContext } from "../context/base.ts";
import { createMiddleware } from "./base.ts";

interface Args<MergeContext extends object> {
	by: (ctx: BunicornContext & MergeContext) => string | void;
}

export function cacheMiddleware<MergeContext extends object = {}>({
	by,
}: Args<MergeContext>) {
	const cache = new Map<unknown, Response>();
	return createMiddleware(async (ctx, next) => {
		const key = by(ctx as BunicornContext & MergeContext);
		if (!key) {
			// No key given, just continue;
			return;
		}
		if (cache.has(key)) {
			return cache.get(key)!.clone();
		}
		const response = await next();
		cache.set(key, response.clone());
		return response.clone();
	});
}
