import { BunicornApp } from "../app/index.js";
import { BunicornError } from "../error/index.js";
import { type GetDependencyFn } from "../helpers/di.js";
import { __getParams } from "../helpers/pathUtils.js";
import {
  type __ExtractParams,
  type __BuiltRoute,
  type BasePath
} from "../router/types.js";
import {
  type __InferBunicornOutput,
  type BunicornSchema
} from "../validation/types.js";
import { __validate } from "../validation/validate.js";
import { type BuniResponseInit } from "./types.js";

export class BunicornContext<
  TPath extends BasePath = BasePath,
  InputSchema extends BunicornSchema | never = never
> {
  // @ts-expect-error
  private __inputSchema: InputSchema;

  private resultHeaders: Record<string, string> = {};
  public params: __ExtractParams<TPath>;

  constructor(
    public request: Request,
    public url: TPath,
    public route: __BuiltRoute<TPath>,
    public match: string[] | boolean,
    public get: GetDependencyFn
  ) {
    this.params = __getParams(route.path, match);
  }

  setHeader(name: string, value: string) {
    this.resultHeaders[name] = value;
  }

  ok() {
    return new Response(undefined, {
      status: 200,
      headers: this.resultHeaders
    }) as any;
  }

  raw<
    T extends
      | ReadableStream
      | BlobPart
      | BlobPart[]
      | FormData
      | URLSearchParams
      | null
  >(body: T, init: BuniResponseInit = {}) {
    this.applyHeaders(init);
    return new Response(body, init) as unknown as T;
  }

  text(body: string, init: BuniResponseInit = {}) {
    init.headers ??= {};
    init.headers["Content-Type"] = "text/plain";
    this.applyHeaders(init);
    return new Response(body, init) as unknown as string;
  }

  json<T extends Record<any, any>>(body: T, init: BuniResponseInit = {}) {
    init.headers ??= {};
    init.headers["Content-Type"] = "application/json";
    for (const key in this.resultHeaders) {
      init.headers[key] = this.resultHeaders[key]!;
    }
    const route = this.route;

    if (route.output) {
      try {
        const parseResult = __validate(
          route.output,
          body,
          route.__outputOptions
        );
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
  }

  stream<T>(body: ReadableStream<T>, init: BuniResponseInit = {}) {
    init.headers ??= {};
    init.headers["Content-Type"] = "text/event-stream";
    this.applyHeaders(init);
    return new Response(body, init) as unknown as ReadableStream<T>;
  }

  private applyHeaders(init: any) {
    init.headers ??= {};
    for (const key in this.resultHeaders) {
      init.headers[key] = this.resultHeaders[key]!;
    }
  }
}

export type __GetContextInput<TContext extends BunicornContext | object> =
  TContext extends BunicornContext<any, infer TSchema>
    ? __InferBunicornOutput<TSchema>
    : never;
