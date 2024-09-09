import { __mergePaths } from "../helpers/pathUtils.ts";
import type { MetaProperties, Route, __AddBasePathToAll } from "./route.ts";
import type { BasePath } from "./types.ts";

export function groupRoutes<
	TBasePath extends BasePath,
	TNewRoutes extends Route<any, any, any, any>[],
>(basePath: TBasePath, routes: TNewRoutes, metaProps?: MetaProperties) {
	return routes.map((route) => {
		route.path = (
			(basePath as string) === "/"
				? route.path
				: __mergePaths(basePath, route.path)
		) as TBasePath;
		if (metaProps) {
			route.meta = Object.assign({}, metaProps, route.meta ?? {});
		}
		return route;
	}) as __AddBasePathToAll<TBasePath, TNewRoutes>;
}
