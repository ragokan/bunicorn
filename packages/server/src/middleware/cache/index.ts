import type { BunicornContext } from "../../context/base.ts";
import type { GetDependencyFn } from "../../helpers/di.ts";
import { createMiddleware } from "../base.ts";
import { type CacheStore, MemoryStore } from "./store.ts";
export type { CacheStore };

interface Args<MergeContext extends Record<string, any>> {
	getKey: (ctx: BunicornContext & MergeContext) => string | void;
	getStore?: (get: GetDependencyFn) => CacheStore;
	tls?: number;
}

export function cacheMiddleware<MergeContext extends Record<string, any> = {}>({
	getKey,
	getStore,
	tls,
}: Args<MergeContext>) {
	return createMiddleware(async (ctx, next) => {
		const store = getStore?.(ctx.get) || new MemoryStore();
		const key = getKey(ctx as BunicornContext & MergeContext);
		if (!key) {
			// No key given, no cache.
			return;
		}
		const cachedResponse = await store.get(key);
		if (cachedResponse) {
			return cachedResponse;
		}
		const response = await next();
		await store.set(key, response.clone(), tls);
		return response.clone();
	});
}
