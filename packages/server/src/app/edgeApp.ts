import {
  type BuiltRoute,
  type BasePath,
  type BaseMethod
} from "../router/types.js";
import { BunicornApp } from "./index.js";
import { type AddBasePathTo, type Route } from "../router/route.js";
import { mergePaths } from "../helpers/pathUtils.js";

export class BunicornEdgeApp<
  TBasePath extends BasePath,
  TRoutes extends Route<any, any, any, any>[] = []
> extends BunicornApp<TBasePath, TRoutes> {
  override addRoute<TRoute extends Route<any, any, any, any>>(
    route: TRoute
  ): BunicornApp<TBasePath, [...TRoutes, AddBasePathTo<TBasePath, TRoute>]> {
    route.path = (
      (this.args.basePath as string) === "/"
        ? route.path
        : mergePaths(this.args.basePath, route.path)
    ) as TBasePath;
    route.middlewares ??= [];
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

    this.routes[route.method as BaseMethod].push(
      route as unknown as BuiltRoute
    );
    return this as unknown as BunicornApp<
      TBasePath,
      [...TRoutes, AddBasePathTo<TBasePath, TRoute>]
    >;
  }
}
