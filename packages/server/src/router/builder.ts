import {
  type BunicornSchema,
  type InferBunicornInput,
  type InferBunicornOutput,
  type ValidateOptions
} from "../validation/types.ts";
import { type BaseSchema as vBaseSchema } from "valibot";
import { type BaseContext } from "../context/baseContext.ts";
import { type BaseMiddleware } from "../middleware.ts";
import { type Route } from "./route.ts";
import { type BaseMethod, type BasePath, type BuiltRoute } from "./types.ts";

export class RouteBuilder<
  TContextResults extends object = {},
  TInput extends BunicornSchema | never = never,
  TOutput extends BunicornSchema | any = any
> {
  private route: Partial<Route<any, any, any, any>> = {
    middlewares: []
  };

  private copy() {
    const newRoute: Partial<BuiltRoute> = {};
    const { middlewares, ...rest } = this.route;
    newRoute.middlewares = [...middlewares!];
    Object.assign(newRoute, rest);
    const rb = new RouteBuilder<TContextResults>();
    rb.route = newRoute;
    return rb;
  }

  public use<TResult extends object | void | Promise<object> | Promise<void>>(
    cb: (context: BaseContext & TContextResults) => TResult
  ) {
    this.route.middlewares!.push(cb as unknown as BaseMiddleware);
    type Result = Awaited<TResult>;
    type NewContext = Result extends void
      ? TContextResults
      : TContextResults & Result;
    return this.copy() as unknown as RouteBuilder<NewContext>;
  }

  public input<TSchema extends BunicornSchema>(
    schema: TSchema,
    ...options: TSchema extends vBaseSchema ? [options?: ValidateOptions] : []
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
    ...options: TSchema extends vBaseSchema ? [options?: ValidateOptions] : []
  ) {
    this.route.output = schema;
    this.route.__outputOptions = options?.[0];
    return this.copy() as unknown as Omit<
      RouteBuilder<TContextResults, TInput, TSchema>,
      "output"
    >;
  }

  private createRoute<
    TMethod extends BaseMethod,
    TPath extends BasePath,
    Out extends InferBunicornInput<TOutput>
  >(
    method: TMethod,
    path: TPath,
    handler: (
      ctx: BaseContext<TPath, TInput> & TContextResults
    ) => Out | Promise<Out>
  ) {
    return Object.assign(this.copy().route, { path, handler, method }) as Route<
      TPath,
      TMethod,
      InferBunicornOutput<TOutput, Awaited<Out>>,
      TInput
    >;
  }

  public get = <
    TPath extends BasePath,
    Out extends InferBunicornInput<TOutput>
  >(
    path: TPath,
    handler: (
      ctx: BaseContext<TPath, TInput> & TContextResults
    ) => Out | Promise<Out>
  ) => this.createRoute("GET", path, handler);

  public post = <
    TPath extends BasePath,
    Out extends InferBunicornInput<TOutput>
  >(
    path: TPath,
    handler: (
      ctx: BaseContext<TPath, TInput> & TContextResults
    ) => Out | Promise<Out>
  ) => this.createRoute("POST", path, handler);

  public put = <
    TPath extends BasePath,
    Out extends InferBunicornInput<TOutput>
  >(
    path: TPath,
    handler: (
      ctx: BaseContext<TPath, TInput> & TContextResults
    ) => Out | Promise<Out>
  ) => this.createRoute("PUT", path, handler);

  public patch = <
    TPath extends BasePath,
    Out extends InferBunicornInput<TOutput>
  >(
    path: TPath,
    handler: (
      ctx: BaseContext<TPath, TInput> & TContextResults
    ) => Out | Promise<Out>
  ) => this.createRoute("PATCH", path, handler);

  public delete = <
    TPath extends BasePath,
    Out extends InferBunicornInput<TOutput>
  >(
    path: TPath,
    handler: (
      ctx: BaseContext<TPath, TInput> & TContextResults
    ) => Out | Promise<Out>
  ) => this.createRoute("DELETE", path, handler);

  public head = <
    TPath extends BasePath,
    Out extends InferBunicornInput<TOutput>
  >(
    path: TPath,
    handler: (
      ctx: BaseContext<TPath, TInput> & TContextResults
    ) => Out | Promise<Out>
  ) => this.createRoute("HEAD", path, handler);

  public options = <
    TPath extends BasePath,
    Out extends InferBunicornInput<TOutput>
  >(
    path: TPath,
    handler: (
      ctx: BaseContext<TPath, TInput> & TContextResults
    ) => Out | Promise<Out>
  ) => this.createRoute("OPTIONS", path, handler);

  public all = <
    TPath extends BasePath,
    Out extends InferBunicornInput<TOutput>
  >(
    path: TPath,
    handler: (
      ctx: BaseContext<TPath, TInput> & TContextResults
    ) => Out | Promise<Out>
  ) => this.createRoute("ALL", path, handler);
}

export { RouteBuilder as RB };
