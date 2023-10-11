import { __mergePaths } from "../helpers/pathUtils.ts";
import { type __AddBasePathToAll, type Route } from "./route.ts";
import { type BasePath } from "./types.ts";

export function groupRoutes<
  TBasePath extends BasePath,
  TNewRoutes extends Route<any, any, any, any>[]
>(basePath: TBasePath, routes: TNewRoutes) {
  return routes.map(route => {
    route.path = (
      (basePath as string) === "/"
        ? route.path
        : __mergePaths(basePath, route.path)
    ) as TBasePath;
    return route;
  }) as __AddBasePathToAll<TBasePath, TNewRoutes>;
}
