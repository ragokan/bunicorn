import type { BaseSchema as vBaseSchema } from "valibot";
import type { BunicornContext } from "../context/types.ts";
import type { BaseMiddleware } from "../middleware.ts";
import type {
	BunicornSchema,
	__InferBunicornInput,
	__InferBunicornOutput,
	__ValidateOptions,
} from "../validation/types.ts";
import type { MetaProperties, Route } from "./route.ts";
import type { BaseMethod, BasePath, __BuiltRoute } from "./types.ts";

export class RouteBuilder<
	TContextResults extends object = {},
	TInput extends BunicornSchema | never = never,
	TOutput extends BunicornSchema | any = any,
> {
	private route: Partial<Route<any, any, any, any>> = {
		middlewares: [],
	};

	private copy() {
		const newRoute: Partial<__BuiltRoute> = {};
		const { middlewares, ...rest } = this.route;
		newRoute.middlewares = [...middlewares!];
		Object.assign(newRoute, rest);
		const rb = new RouteBuilder<TContextResults>();
		rb.route = newRoute;
		return rb;
	}

	public use<TResult extends object | void | Promise<object> | Promise<void>>(
		cb: (context: BunicornContext & TContextResults) => TResult,
	) {
		this.route.middlewares!.push(cb as unknown as BaseMiddleware);
		type Result = Awaited<TResult>;
		type NewContext = Result extends void
			? TContextResults
			: TContextResults & Result;
		return this.copy() as unknown as RouteBuilder<NewContext, TInput, TOutput>;
	}

	public input<TSchema extends BunicornSchema>(
		schema: TSchema,
		...options: TSchema extends vBaseSchema<any, any, any>
			? [options?: __ValidateOptions]
			: []
	) {
		this.route.input = schema;
		this.route.__inputOptions = options?.[0];
		return this.copy() as unknown as Omit<
			RouteBuilder<TContextResults, TSchema, TOutput>,
			"input" | "get" | "head" | "options"
		>;
	}

	public output<TSchema extends BunicornSchema>(
		schema: TSchema,
		...options: TSchema extends vBaseSchema<any, any, any>
			? [options?: __ValidateOptions]
			: []
	) {
		this.route.output = schema;
		this.route.__outputOptions = options?.[0];
		return this.copy() as unknown as Omit<
			RouteBuilder<TContextResults, TInput, TSchema>,
			"output"
		>;
	}

	public meta(meta: MetaProperties) {
		this.route.meta = Object.assign({}, meta, this.route.meta ?? {});
		return this.copy() as unknown as Omit<
			RouteBuilder<TContextResults, TInput, TOutput>,
			"meta"
		>;
	}

	private createRoute<
		TMethod extends BaseMethod,
		TPath extends BasePath,
		Out extends __InferBunicornInput<TOutput>,
	>(
		method: TMethod,
		path: TPath,
		handler: (
			ctx: BunicornContext<TPath, __InferBunicornOutput<TInput>> &
				TContextResults,
		) => Out | Promise<Out>,
	) {
		return Object.assign(this.copy().route, { path, handler, method }) as Route<
			TPath,
			TMethod,
			__InferBunicornOutput<TOutput, Awaited<Out>>,
			TInput
		>;
	}

	public get = <
		TPath extends BasePath,
		Out extends __InferBunicornInput<TOutput>,
	>(
		path: TPath,
		handler: (
			ctx: BunicornContext<TPath, __InferBunicornOutput<TInput>> &
				TContextResults,
		) => Out | Promise<Out>,
	) => this.createRoute("GET", path, handler);

	public post = <
		TPath extends BasePath,
		Out extends __InferBunicornInput<TOutput>,
	>(
		path: TPath,
		handler: (
			ctx: BunicornContext<TPath, __InferBunicornOutput<TInput>> &
				TContextResults,
		) => Out | Promise<Out>,
	) => this.createRoute("POST", path, handler);

	public put = <
		TPath extends BasePath,
		Out extends __InferBunicornInput<TOutput>,
	>(
		path: TPath,
		handler: (
			ctx: BunicornContext<TPath, __InferBunicornOutput<TInput>> &
				TContextResults,
		) => Out | Promise<Out>,
	) => this.createRoute("PUT", path, handler);

	public patch = <
		TPath extends BasePath,
		Out extends __InferBunicornInput<TOutput>,
	>(
		path: TPath,
		handler: (
			ctx: BunicornContext<TPath, __InferBunicornOutput<TInput>> &
				TContextResults,
		) => Out | Promise<Out>,
	) => this.createRoute("PATCH", path, handler);

	public delete = <
		TPath extends BasePath,
		Out extends __InferBunicornInput<TOutput>,
	>(
		path: TPath,
		handler: (
			ctx: BunicornContext<TPath, __InferBunicornOutput<TInput>> &
				TContextResults,
		) => Out | Promise<Out>,
	) => this.createRoute("DELETE", path, handler);

	public head = <
		TPath extends BasePath,
		Out extends __InferBunicornInput<TOutput>,
	>(
		path: TPath,
		handler: (
			ctx: BunicornContext<TPath, __InferBunicornOutput<TInput>> &
				TContextResults,
		) => Out | Promise<Out>,
	) => this.createRoute("HEAD", path, handler);

	public options = <
		TPath extends BasePath,
		Out extends __InferBunicornInput<TOutput>,
	>(
		path: TPath,
		handler: (
			ctx: BunicornContext<TPath, __InferBunicornOutput<TInput>> &
				TContextResults,
		) => Out | Promise<Out>,
	) => this.createRoute("OPTIONS", path, handler);

	public all = <
		TPath extends BasePath,
		Out extends __InferBunicornInput<TOutput>,
	>(
		path: TPath,
		handler: (
			ctx: BunicornContext<TPath, __InferBunicornOutput<TInput>> &
				TContextResults,
		) => Out | Promise<Out>,
	) => this.createRoute("ALL", path, handler);
}

export { RouteBuilder as RB };

// add global parsers
// add cache to getText -> getJson
// then create middleware like
/* 
cache(fn, { by: (ctx) => [ctx.params.id], ttl: 1000 })
cacheAsync(fn, { by: (ctx) => [ctx.params.id], ttl: 1000 })
*/
// function wrap<TContext extends BunicornContext<any, any>, Out>(
//   cb: (ctx: TContext) => Out
// ) {
//   return (ctx: TContext): Out => {
//     return cb(ctx);
//   };
// }
