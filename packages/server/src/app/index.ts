import { __BunicornContext } from "../context/base.ts";
import type { BunicornContext } from "../context/types.ts";
import { __checkPathIsRegex } from "../helpers/checkIsRegex.ts";
import { __createDependencyStore } from "../helpers/di.ts";
import { __getPath } from "../helpers/pathRegexps.ts";
import { __mergePaths } from "../helpers/pathUtils.ts";
import { __testPath } from "../helpers/testPath.ts";
import {
	type AsyncHandler,
	type BaseMiddleware,
	BunicornError,
	type Handler,
} from "../index.ts";
import type {
	Route,
	__AddBasePathTo,
	__AddBasePathToAll,
} from "../router/route.ts";
import type { BaseMethod, BasePath, __BuiltRoute } from "../router/types.ts";

export type PrivateBunicornApp = BunicornApp<any> & {
	routes: Record<BasePath, __BuiltRoute[]>;
	args: AppArgs<any>;
};

export interface AppArgs<TPath extends BasePath> {
	basePath: TPath;
}

export class BunicornApp<
	TBasePath extends BasePath = "/",
	TRoutes extends Route<any, any, any, any>[] = [],
> {
	constructor(
		protected args: AppArgs<TBasePath> = { basePath: "/" as TBasePath },
	) {
		this.handleRequest = this.handleRequest.bind(this);
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
		ALL: [],
	};

	protected middlewares: BaseMiddleware[] = [];

	public addHandler(handler: Handler) {
		handler(this as unknown as PrivateBunicornApp);
		return this;
	}

	public async addAsyncHandler(handler: AsyncHandler) {
		await handler(this as unknown as PrivateBunicornApp);
		return this;
	}

	public addMiddleware(middleware: BaseMiddleware) {
		this.middlewares.push(middleware);
		return this;
	}

	public addRoute<TRoute extends Route<any, any, any, any>>(route: TRoute) {
		route.path = (
			(this.args.basePath as string) == "/"
				? route.path
				: __mergePaths(this.args.basePath, route.path)
		) as TBasePath;
		route.middlewares ??= [];
		route.middlewares = [...this.middlewares, ...route.middlewares];
		if (__checkPathIsRegex(route.path)) {
			(route as __BuiltRoute).regexp = new RegExp(
				new RegExp(
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
				),
			);
		}
		this.routes[route.method as BaseMethod].push(route as __BuiltRoute);
		return this as unknown as BunicornApp<
			TBasePath,
			[...TRoutes, __AddBasePathTo<TBasePath, TRoute>]
		>;
	}

	public addRoutes<TNewRoutes extends Route<any, any, any, any>[]>(
		routes: TNewRoutes,
	) {
		routes.forEach((route) => {
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
		route: __BuiltRoute,
	): Promise<Response | void> {
		const match = __testPath(route, path);
		if (!match) {
			return;
		}

		try {
			const context = new __BunicornContext(
				request,
				url as TBasePath,
				route,
				match,
				BunicornApp.getFromStore,
			) as BunicornContext<BasePath, never>;

			const { middlewares, handler } = route;
			const middlewaresLength = middlewares.length;

			for (let i = 0; i < middlewaresLength; i++) {
				const result = await middlewares[i]!(context);
				if (result instanceof Response) {
					return result;
				}
				if (result) {
					Object.assign(context, result);
				}
			}

			const result = await handler(context);
			if (result instanceof Response) {
				return result;
			}

			return Response.json(
				{ message: "Internal Server Error", status: 500 },
				{ status: 500 },
			);
		} catch (error) {
			if (error instanceof BunicornError) {
				return new Response(error.toString(), {
					status: error.status,
					headers: { "Content-Type": "application/json" },
				});
			}

			if (error instanceof Error) {
				BunicornApp.onGlobalError(error);
			}

			return Response.json(
				{ message: "Internal Server Error", status: 500 },
				{ status: 500 },
			);
		}
	}

	public async handleRequest(request: Request, _server?: import("bun").Server) {
		const path = __getPath(request.url);
		const method = request.method as BaseMethod;
		const methodRoutes = this.routes[method];
		const allRoutes = this.routes.ALL;

		for (let i = 0, len = methodRoutes.length; i < len; i++) {
			const result = await this.useRoute(
				request,
				request.url,
				path,
				methodRoutes[i]!,
			);
			if (result) {
				return result;
			}
		}

		for (let i = 0, len = allRoutes.length; i < len; i++) {
			const result = await this.useRoute(
				request,
				request.url,
				path,
				allRoutes[i]!,
			);
			if (result) {
				return result;
			}
		}

		return Response.json(
			{
				message: `The method '${method}' to path '${path}' does not exist.`,
				status: 404,
			},
			{ status: 404 },
		);
	}

	public readonly staticRoutes: Record<`/${string}`, Response> = {};

	// Only available in Bun
	public serve(
		options: Partial<
			Omit<import("bun").ServeOptions & import("bun").TLSServeOptions, "fetch">
		> = {},
	) {
		if (!IS_BUN) {
			throw new Error("This method can only be called in Bun.");
		}

		Bun.gc(true);
		return Bun.serve({
			...options,
			fetch: this.handleRequest,
			static: Object.assign({}, this.staticRoutes, options.static),
		});
	}
}
