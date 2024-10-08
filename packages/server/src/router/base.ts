import type { BaseSchema as vBaseSchema } from "valibot";
import type { BunicornContext } from "../context/base.ts";
import type { BaseMiddleware } from "../middleware/index.ts";
import type {
	BunicornSchema,
	__InferBunicornInput,
	__InferBunicornOutput,
	__ValidateOptions,
} from "../validation/types.ts";
import type { MetaProperties, Route } from "./route.ts";
import type {
	BaseMethod,
	BasePath,
	BunicornResponse,
	__BuiltRoute,
} from "./types.ts";

export class Router<
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
		const rb = new Router<TContextResults>();
		rb.route = newRoute;
		return rb;
	}

	public use<TResult extends object | void | Promise<object> | Promise<void>>(
		cb: (
			context: BunicornContext & TContextResults,
			next: () => Promise<Response>,
		) => TResult,
	) {
		const newBuilder = this.copy();
		newBuilder.route.middlewares!.push(cb as unknown as BaseMiddleware);
		type Result = Awaited<TResult>;
		type NewContext = Result extends void | Response
			? TContextResults
			: TContextResults & Result;
		return newBuilder as unknown as Router<NewContext, TInput, TOutput>;
	}

	public input<TSchema extends BunicornSchema>(
		schema: TSchema,
		...options: TSchema extends vBaseSchema<any, any, any>
			? [options?: __ValidateOptions]
			: []
	) {
		const newBuilder = this.copy();
		newBuilder.route.input = schema;
		newBuilder.route.__inputOptions = options?.[0];
		return newBuilder as unknown as Omit<
			Router<TContextResults, TSchema, TOutput>,
			"input" | "get" | "head" | "options"
		>;
	}

	public output<TSchema extends BunicornSchema>(
		schema: TSchema,
		...options: TSchema extends vBaseSchema<any, any, any>
			? [options?: __ValidateOptions]
			: []
	) {
		const newBuilder = this.copy();
		newBuilder.route.output = schema;
		newBuilder.route.__outputOptions = options?.[0];
		return newBuilder as unknown as Omit<
			Router<TContextResults, TInput, TSchema>,
			"output"
		>;
	}

	public meta(meta: MetaProperties) {
		const newBuilder = this.copy();
		newBuilder.route.meta = Object.assign(
			{},
			meta,
			newBuilder.route.meta ?? {},
		);
		return newBuilder as unknown as Omit<
			Router<TContextResults, TInput, TOutput>,
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
		) => BunicornResponse<Out> | Promise<BunicornResponse<Out>>,
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
		) => BunicornResponse<Out> | Promise<BunicornResponse<Out>>,
	) => this.createRoute("GET", path, handler);

	public post = <
		TPath extends BasePath,
		Out extends __InferBunicornInput<TOutput>,
	>(
		path: TPath,
		handler: (
			ctx: BunicornContext<TPath, __InferBunicornOutput<TInput>> &
				TContextResults,
		) => BunicornResponse<Out> | Promise<BunicornResponse<Out>>,
	) => this.createRoute("POST", path, handler);

	public put = <
		TPath extends BasePath,
		Out extends __InferBunicornInput<TOutput>,
	>(
		path: TPath,
		handler: (
			ctx: BunicornContext<TPath, __InferBunicornOutput<TInput>> &
				TContextResults,
		) => BunicornResponse<Out> | Promise<BunicornResponse<Out>>,
	) => this.createRoute("PUT", path, handler);

	public patch = <
		TPath extends BasePath,
		Out extends __InferBunicornInput<TOutput>,
	>(
		path: TPath,
		handler: (
			ctx: BunicornContext<TPath, __InferBunicornOutput<TInput>> &
				TContextResults,
		) => BunicornResponse<Out> | Promise<BunicornResponse<Out>>,
	) => this.createRoute("PATCH", path, handler);

	public delete = <
		TPath extends BasePath,
		Out extends __InferBunicornInput<TOutput>,
	>(
		path: TPath,
		handler: (
			ctx: BunicornContext<TPath, __InferBunicornOutput<TInput>> &
				TContextResults,
		) => BunicornResponse<Out> | Promise<BunicornResponse<Out>>,
	) => this.createRoute("DELETE", path, handler);

	public head = <
		TPath extends BasePath,
		Out extends __InferBunicornInput<TOutput>,
	>(
		path: TPath,
		handler: (
			ctx: BunicornContext<TPath, __InferBunicornOutput<TInput>> &
				TContextResults,
		) => BunicornResponse<Out> | Promise<BunicornResponse<Out>>,
	) => this.createRoute("HEAD", path, handler);

	public options = <
		TPath extends BasePath,
		Out extends __InferBunicornInput<TOutput>,
	>(
		path: TPath,
		handler: (
			ctx: BunicornContext<TPath, __InferBunicornOutput<TInput>> &
				TContextResults,
		) => BunicornResponse<Out> | Promise<BunicornResponse<Out>>,
	) => this.createRoute("OPTIONS", path, handler);

	public all = <
		TPath extends BasePath,
		Out extends __InferBunicornInput<TOutput>,
	>(
		path: TPath,
		handler: (
			ctx: BunicornContext<TPath, __InferBunicornOutput<TInput>> &
				TContextResults,
		) => BunicornResponse<Out> | Promise<BunicornResponse<Out>>,
	) => this.createRoute("ALL", path, handler);
}
