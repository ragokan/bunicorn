import { mergePaths } from "../helpers/pathUtils.js";
import { type AddBasePathToAll, type Route } from "./route.js";
import { type BasePath } from "./types.js";

export function groupRoutes<
  TBasePath extends BasePath,
  TNewRoutes extends Route<any, any, any, any>[]
>(basePath: TBasePath, routes: TNewRoutes) {
  return routes.map(route => {
    route.path = (
      (basePath as string) === "/"
        ? route.path
        : mergePaths(basePath, route.path)
    ) as TBasePath;
    return route;
  }) as AddBasePathToAll<TBasePath, TNewRoutes>;
}
