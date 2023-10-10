import { __getPath } from "src/helpers/pathRegexps.js";
import { type BaseContext } from "../context/baseContext.js";
import { createContext } from "../context/createContext.js";
import { _createDependencyStore } from "../helpers/di.js";
import { mergePaths } from "../helpers/pathUtils.js";
import { BunicornError, type Handler } from "../index.js";
import {
  type AddBasePathTo,
  type AddBasePathToAll,
  type Route
} from "../router/route.js";
import {
  type BaseMethod,
  type BasePath,
  type BuiltRoute
} from "../router/types.js";

export type PrivateBunicornApp = BunicornApp<any> & {
  routes: Record<BasePath, BuiltRoute[]>;
  args: AppArgs<any>;
};

export interface AppArgs<TPath extends BasePath> {
  basePath: TPath;
}

export class BunicornApp<
  TBasePath extends BasePath,
  TRoutes extends Route<any, any, any, any>[] = []
> {
  constructor(protected args: AppArgs<TBasePath>) {
    this.handleRequest = this.handleRequest.bind(this);
    // :/ Do nothing
  }
  public static onGlobalError(error: Error) {
    console.error(error);
  }

  public static getFromStore = _createDependencyStore().get;

  protected routes: Record<BaseMethod, BuiltRoute[]> = {
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
        : mergePaths(this.args.basePath, route.path)
    ) as TBasePath;
    this.routes[route.method as BaseMethod].push(
      Object.assign(route as Route<any, any, any, any>, {
        regexp: new RegExp(
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
        ),
        middlewares: route.middlewares ?? []
      }) as BuiltRoute
    );
    return this as unknown as BunicornApp<
      TBasePath,
      [...TRoutes, AddBasePathTo<TBasePath, TRoute>]
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
      [...TRoutes, ...AddBasePathToAll<TBasePath, TNewRoutes>]
    >;
  }

  protected async useRoute(
    request: Request,
    url: string,
    path: string,
    route: BuiltRoute
  ): Promise<Response | void> {
    const match = path.match(route.regexp);
    if (match) {
      try {
        let context = createContext({
          use: BunicornApp.getFromStore,
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
    const method = request.method as BaseMethod;

    for (const route of this.routes[method]) {
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
        message: `The method '${method}' to path '${path}' does not exists.`,
        status: 404
      }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }
}
