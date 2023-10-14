import {
  type __BuiltRoute,
  type BasePath,
  type BaseMethod
} from "../router/types.ts";
import { BunicornApp } from "./index.ts";
import { type __AddBasePathTo, type Route } from "../router/route.ts";
import { __mergePaths } from "../helpers/pathUtils.ts";
import { __checkPathIsRegex } from "../helpers/checkIsRegex.ts";

export class BunicornEdgeApp<
  TBasePath extends BasePath,
  TRoutes extends Route<any, any, any, any>[] = []
> extends BunicornApp<TBasePath, TRoutes> {
  override addRoute<TRoute extends Route<any, any, any, any>>(
    route: TRoute
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
                .map(part => {
                  if (part.startsWith("...")) {
                    return "((?:[^/]+/)*[^/]+)?";
                  }
                  if (part.startsWith(":")) {
                    return "([^/]+)";
                  }
                  return part;
                })
                .join("/")}$`
            ));
          }
        }
      });
    }

    this.routes[route.method as BaseMethod].push(
      route as unknown as __BuiltRoute
    );
    return this as unknown as BunicornApp<
      TBasePath,
      [...TRoutes, __AddBasePathTo<TBasePath, TRoute>]
    >;
  }
}
