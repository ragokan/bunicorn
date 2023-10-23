import { BunicornApp } from "../app/index.ts";
import { BunicornError } from "../error/index.ts";
import { type GetDependencyFn } from "../helpers/di.ts";
import { __getParams } from "../helpers/pathUtils.ts";
import {
  type BasePath,
  type __BuiltRoute,
  type __ExtractParams
} from "../router/types.ts";
import { __validate } from "../validation/validate.ts";
import { type BuniResponseInit } from "./types.ts";

export interface BunicornContext<
  TPath extends BasePath = BasePath,
  InputSchema = never
> {
  request: Request;
  url: TPath;
  route: __BuiltRoute<TPath>;
  match: string[] | boolean;
  get: GetDependencyFn;
  params: __ExtractParams<TPath>;

  setHeader(name: string, value: string): void;
  ok(): any;
  raw<T>(body: T, init?: BuniResponseInit): T;
  text(body: string, init?: BuniResponseInit): string;
  json<T>(body: T, init?: BuniResponseInit): T;
  stream<T>(
    body: ReadableStream<T>,
    init?: BuniResponseInit
  ): ReadableStream<T>;

  [__inputType]: InputSchema;
}

interface PrivateBunicornContext<
  TPath extends BasePath = BasePath,
  InputSchema = never
> extends BunicornContext<TPath, InputSchema> {
  resultHeaders?: Record<string, string>;
  applyHeaders(init: any): void;
}

export interface BunicornContextConstructor<
  TPath extends BasePath = BasePath,
  InputSchema = never
> {
  new (
    request: Request,
    url: TPath,
    route: __BuiltRoute<TPath>,
    match: string[] | boolean,
    get: GetDependencyFn
  ): BunicornContext<TPath, InputSchema>;
}

const __BunicornContext = function <TPath extends BasePath = BasePath>(
  this: PrivateBunicornContext<any, any>,
  request: Request,
  url: TPath,
  route: __BuiltRoute<TPath>,
  match: string[] | boolean,
  get: GetDependencyFn
) {
  this.request = request;
  this.url = url;
  this.route = route;
  this.match = match;
  this.get = get;
  this.params = __getParams(route.path, match);
} as any as BunicornContextConstructor;

__BunicornContext.prototype.setHeader = function (
  this: PrivateBunicornContext,
  name: string,
  value: string
) {
  this.resultHeaders ??= {};
  this.resultHeaders[name] = value;
};

__BunicornContext.prototype.ok = function (this: PrivateBunicornContext) {
  return new Response(undefined, {
    status: 200,
    headers: this.resultHeaders
  }) as any;
};

__BunicornContext.prototype.raw = function <
  T extends
    | ReadableStream
    | BlobPart
    | BlobPart[]
    | FormData
    | URLSearchParams
    | null
>(this: PrivateBunicornContext, body: T, init: BuniResponseInit = {}) {
  this.applyHeaders(init);
  return new Response(body, init) as unknown as T;
};

__BunicornContext.prototype.text = function (
  this: PrivateBunicornContext,
  body: string,
  init: any = {}
) {
  init.headers ??= {};
  init.headers["Content-Type"] = "text/plain";
  this.applyHeaders(init);
  return new Response(body, init) as any;
};

__BunicornContext.prototype.json = function <T extends Record<any, any>>(
  this: PrivateBunicornContext,
  body: T,
  init: BuniResponseInit = {}
) {
  init.headers ??= {};
  init.headers["Content-Type"] = "application/json";
  for (const key in this.resultHeaders) {
    init.headers[key] = this.resultHeaders[key]!;
  }
  const route = this.route;

  if (route.output) {
    try {
      const parseResult = __validate(route.output, body, route.__outputOptions);
      return new Response(JSON.stringify(parseResult), init) as any as T;
    } catch (error) {
      BunicornApp.onGlobalError(
        new BunicornError(
          `Failed to parse output for the method '${route.method}' to path '${route.path}'.`,
          {
            data: {
              path: route.path,
              output: body,
              schema: route.output,
              issues: error
            }
          }
        )
      );
      throw new BunicornError(
        "Failed to parse output. This should be handled internally."
      );
    }
  }
  return new Response(JSON.stringify(body), init) as unknown as T;
};

__BunicornContext.prototype.stream = function <T>(
  this: PrivateBunicornContext,
  body: ReadableStream<T>,
  init: BuniResponseInit = {}
) {
  init.headers ??= {};
  init.headers["Content-Type"] = "text/event-stream";
  this.applyHeaders(init);
  return new Response(body, init) as unknown as ReadableStream<T>;
};

__BunicornContext.prototype.applyHeaders = function (
  this: PrivateBunicornContext,
  init: any
) {
  if (!this.resultHeaders) {
    return;
  }
  init.headers ??= {};
  for (const key in this.resultHeaders) {
    init.headers[key] = this.resultHeaders[key];
  }
};

declare const __inputType: unique symbol;

export type __GetContextInput<
  TContext extends BunicornContext<any, any> | object
> = TContext extends BunicornContext<any, any>
  ? TContext[typeof __inputType]
  : never;

export { __BunicornContext };
