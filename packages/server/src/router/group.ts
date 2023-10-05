import { mergePaths } from "../helpers/pathUtils.ts";
import { type AddBasePathToAll, type Route } from "./route.ts";
import { type BasePath } from "./types.ts";

export function groupRoutes<
  TBasePath extends BasePath,
  TNewRoutes extends Route[]
>(basePath: TBasePath, ...routes: TNewRoutes) {
  return routes.map(route => {
    route.path = (
      (basePath as string) === "/"
        ? route.path
        : mergePaths(basePath, route.path)
    ) as TBasePath;
    return route;
  }) as AddBasePathToAll<TNewRoutes, TBasePath>;
}
