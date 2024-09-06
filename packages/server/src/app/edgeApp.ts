import { __checkPathIsRegex } from "../helpers/checkIsRegex.ts";
import { __getPath } from "../helpers/pathRegexps.ts";
import { __mergePaths } from "../helpers/pathUtils.ts";
import type { Route, __AddBasePathTo } from "../router/route.ts";
import type { BaseMethod, BasePath, __BuiltRoute } from "../router/types.ts";
import { BunicornApp } from "./index.ts";

export class BunicornEdgeApp<
	TBasePath extends BasePath,
	TRoutes extends Route<any, any, any, any>[] = [],
> extends BunicornApp<TBasePath, TRoutes> {
	override addRoute<TRoute extends Route<any, any, any, any>>(
		route: TRoute,
	): BunicornApp<TBasePath, [...TRoutes, __AddBasePathTo<TBasePath, TRoute>]> {
		route.path = (
			(this.args.basePath as string) === "/"
				? route.path
				: __mergePaths(this.args.basePath, route.path)
		) as TBasePath;
		route.middlewares ??= [];
		if (__checkPathIsRegex(route.path)) {
			Object.defineProperties(route, {
				regexp: {
					get() {
						return ((route as any).__regexp ??= new RegExp(
							`^${(route.path as TBasePath)
								.split("/")
								.map((part) => {
									if (part.startsWith("...")) {
										return "((?:[^/]+/)*[^/]+)?";
									}
									if (part.startsWith(":")) {
										return "([^/]+)";
									}
									return part;
								})
								.join("/")}$`,
						));
					},
				},
			});
		}

		this.routes[route.method as BaseMethod].push(
			route as unknown as __BuiltRoute,
		);
		return this as unknown as BunicornApp<
			TBasePath,
			[...TRoutes, __AddBasePathTo<TBasePath, TRoute>]
		>;
	}

	public override async handleRequest(request: Request) {
		const path = __getPath(request.url);

		for (const route of this.routes[request.method as BaseMethod]) {
			const result = await this.useRoute(request, request.url, path, route);
			if (result) {
				return result;
			}
		}
		for (const route of this.routes.ALL) {
			const result = await this.useRoute(request, request.url, path, route);
			if (result) {
				return result;
			}
		}

		return new Response(
			JSON.stringify({
				message: `The method '${request.method}' to path '${path}' does not exists.`,
				status: 404,
			}),
			{ status: 404, headers: { "Content-Type": "application/json" } },
		);
	}
}
