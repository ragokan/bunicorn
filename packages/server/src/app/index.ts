import { type BaseContext } from "../context/baseContext.ts";
import { __createContext } from "../context/createContext.ts";
import { __checkPathIsRegex } from "../helpers/checkIsRegex.ts";
import { __createDependencyStore } from "../helpers/di.ts";
import { __getPath } from "../helpers/pathRegexps.ts";
import { __mergePaths } from "../helpers/pathUtils.ts";
import { __testPath } from "../helpers/testPath.ts";
import { BunicornError, type Handler } from "../index.ts";
import {
  type __AddBasePathTo,
  type __AddBasePathToAll,
  type Route
} from "../router/route.ts";
import {
  type BaseMethod,
  type BasePath,
  type __BuiltRoute
} from "../router/types.ts";

export type PrivateBunicornApp = BunicornApp<any> & {
  routes: Record<BasePath, __BuiltRoute[]>;
  args: AppArgs<any>;
};

export interface AppArgs<TPath extends BasePath> {
  basePath: TPath;
}

export class BunicornApp<
  TBasePath extends BasePath = "/",
  TRoutes extends Route<any, any, any, any>[] = []
> {
  constructor(
    protected args: AppArgs<TBasePath> = { basePath: "/" as TBasePath }
  ) {
    this.handleRequest = this.handleRequest.bind(this);
    // :/ Do nothing
  }
  public static onGlobalError(error: Error) {
    console.error(error);
  }

  public static getFromStore = __createDependencyStore().get;

  protected routes: Record<BaseMethod, __BuiltRoute[]> = {
    GET: [],
    POST: [],
    PATCH: [],
    PUT: [],
    DELETE: [],
    OPTIONS: [],
    HEAD: [],
    ALL: []
  };

  public with(handler: Handler) {
    handler(this as unknown as PrivateBunicornApp);
    return this;
  }

  public addRoute<TRoute extends Route<any, any, any, any>>(route: TRoute) {
    route.path = (
      (this.args.basePath as string) === "/"
        ? route.path
        : __mergePaths(this.args.basePath, route.path)
    ) as TBasePath;
    route.middlewares ??= [];
    if (__checkPathIsRegex(route.path)) {
      (route as __BuiltRoute).regexp = new RegExp(
        new RegExp(
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
        )
      );
    }
    this.routes[route.method as BaseMethod].push(route as __BuiltRoute);
    return this as unknown as BunicornApp<
      TBasePath,
      [...TRoutes, __AddBasePathTo<TBasePath, TRoute>]
    >;
  }

  public addRoutes<TNewRoutes extends Route<any, any, any, any>[]>(
    routes: TNewRoutes
  ) {
    routes.forEach(route => {
      this.addRoute(route);
    });
    return this as unknown as BunicornApp<
      TBasePath,
      [...TRoutes, ...__AddBasePathToAll<TBasePath, TNewRoutes>]
    >;
  }

  protected async useRoute(
    request: Request,
    url: string,
    path: string,
    route: __BuiltRoute
  ): Promise<Response | void> {
    const match = __testPath(route, path);
    if (match) {
      try {
        let context = __createContext({
          get: BunicornApp.getFromStore,
          request,
          route,
          match,
          url
        }) as BaseContext<BasePath, never> & { _route: Route };
        context._route = route;

        for (const middleware of route.middlewares) {
          const result = await middleware(context);
          if (!result) {
            continue;
          }
          if (result instanceof Response) {
            return result;
          }
          context = Object.assign(context, result);
        }

        const result = await route.handler(context as any);
        if (result instanceof Response) {
          return result;
        }
        return new Response(
          JSON.stringify({ message: "Internal Server Error", status: 500 }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      } catch (error) {
        if (error instanceof BunicornError) {
          return new Response(error.toString(), {
            status: error.args.status,
            headers: { "Content-Type": "application/json" }
          });
        } else if (error instanceof Error) {
          BunicornApp.onGlobalError(error);
        }
        return new Response(
          JSON.stringify({ message: "Internal Server Error", status: 500 }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  }

  public async handleRequest(request: Request) {
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
        status: 404
      }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }
}

export { BunicornApp as BuniApp };
