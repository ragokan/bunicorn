import type { Serve, ServeOptions, Server } from "bun";
import { BunicornContext } from "../context/base.ts";
import { type GetDependencyFn, createDependencyStore } from "../helpers/di.ts";
import { __getPath } from "../helpers/pathRegexps.ts";
import {
	type AsyncHandler,
	type BaseMiddleware,
	type Handler,
	HttpError,
} from "../index.ts";
import { RouteTrieMatcher } from "../matchers/routeTrie.ts";
import type {
	Route,
	__AddBasePathTo,
	__AddBasePathToAll,
} from "../router/route.ts";
import type { BaseMethod, BasePath, __BuiltRoute } from "../router/types.ts";

export type PrivateBunicornApp = BunicornApp<any> & {
	routeTrie: RouteTrieMatcher;
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
		this.routeTrie = new RouteTrieMatcher(args.basePath);
	}
	public static onGlobalError(error: Error) {
		console.error(error);
	}

	public static getFromStore: GetDependencyFn = createDependencyStore().get;

	protected middlewares: BaseMiddleware[] = [];
	protected routeTrie: RouteTrieMatcher;

	public addHandler(handler: Handler): this {
		handler(this as unknown as PrivateBunicornApp);
		return this;
	}

	public async addAsyncHandler(handler: AsyncHandler): Promise<this> {
		await handler(this as unknown as PrivateBunicornApp);
		return this;
	}

	public addMiddleware(middleware: BaseMiddleware): this {
		this.middlewares.push(middleware);
		return this;
	}

	public addRoute<TRoute extends Route<any, any, any, any>>(
		route: TRoute,
	): BunicornApp<TBasePath, [...TRoutes, __AddBasePathTo<TBasePath, TRoute>]> {
		route.middlewares ??= [];
		route.middlewares = [...this.middlewares, ...route.middlewares];

		this.routeTrie.addRoute(route as unknown as Route);

		return this as unknown as BunicornApp<
			TBasePath,
			[...TRoutes, __AddBasePathTo<TBasePath, TRoute>]
		>;
	}

	public addRoutes<TNewRoutes extends Route<any, any, any, any>[]>(
		routes: TNewRoutes,
	): BunicornApp<
		TBasePath,
		[...TRoutes, ...__AddBasePathToAll<TBasePath, TNewRoutes>]
	> {
		routes.forEach((route) => {
			this.addRoute(route);
		});
		return this as unknown as BunicornApp<
			TBasePath,
			[...TRoutes, ...__AddBasePathToAll<TBasePath, TNewRoutes>]
		>;
	}

	public async executeMiddlewaresAndHandler(
		context: BunicornContext,
		middlewares: Array<
			(
				context: BunicornContext,
				next: () => Promise<Response>,
			) => Promise<Response | void | Record<string, unknown>>
		>,
		handler: (context: BunicornContext) => Promise<Response | void>,
	): Promise<Response> {
		let index = 0;

		async function next(): Promise<Response> {
			if (index < middlewares.length) {
				const middleware = middlewares[index]!;
				index++;
				const result = await middleware(context, next);
				if (result instanceof Response) {
					return result;
				}
				if (result && typeof result === "object") {
					Object.assign(context, result);
				}
				return await next();
			}
			const result = await handler(context);
			if (result instanceof Response) {
				return result;
			}

			return Response.json(
				{ message: "No Response is returned from handlers.", status: 500 },
				{ status: 500 },
			);
		}

		return await next();
	}

	protected async useRoute(
		request: Request,
		url: string,
		route: __BuiltRoute,
	): Promise<Response> {
		try {
			const context = new BunicornContext(
				request,
				url as TBasePath,
				BunicornApp.getFromStore,
				route.params,
				route,
			);

			const middlewares = route.middlewares;

			// Ensure that the handler is only called once
			let handlerCalled: boolean | undefined;
			let handlerResult: Response | undefined;
			async function handler(context: BunicornContext) {
				if (handlerCalled) {
					return handlerResult;
				}
				handlerCalled = true;
				return (handlerResult = await route.handler(context));
			}

			const response = await this.executeMiddlewaresAndHandler(
				context,
				middlewares,
				handler,
			);
			return response;
		} catch (error) {
			if (error instanceof HttpError) {
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

	public async handleRequest(
		request: Request,
		_server?: import("bun").Server,
	): Promise<Response> {
		const path = __getPath(request.url);
		const method = request.method as BaseMethod;

		const route = this.routeTrie.matchRoute(method, path);
		if (route !== null) {
			return this.useRoute(request, path, route);
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

	// Only use with Bun
	public serve<T>(options: Omit<ServeOptions & Serve<T>, "fetch">): Server {
		// Default to Bun if it's available
		if ("Bun" in globalThis) {
			Bun.gc(true);
			return Bun.serve({
				...options,
				fetch: this.handleRequest,
				static: Object.assign({}, this.staticRoutes, options.static),
			});
		}

		throw new Error(
			"For other runtimes, use wrappers or `const res = app.handleRequest(req)`.",
		);
	}
}
