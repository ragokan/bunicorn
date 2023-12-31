import { BunicornApp } from "../app/index.ts";
import { BunicornError } from "../error/index.ts";
import { type GetDependencyFn } from "../helpers/di.ts";
import { formDataToObject } from "../helpers/formDataToObject.ts";
import { __getSearchParams } from "../helpers/pathRegexps.ts";
import { __getParams } from "../helpers/pathUtils.ts";
import { type Route } from "../router/route.ts";
import { type BasePath, type __BuiltRoute } from "../router/types.ts";
import { type BunicornSchema } from "../validation/types.ts";
import { __validate } from "../validation/validate.ts";
import {
  type BuniResponseInit,
  type BunicornContextConstructor,
  type __PrivateBunicornContext
} from "./types.ts";

const __BunicornContext = function <TPath extends BasePath = BasePath>(
  this: __PrivateBunicornContext<any, any>,
  request: Request,
  url: TPath,
  route: __BuiltRoute<TPath>,
  match: string[] | boolean,
  get: GetDependencyFn
) {
  // Base
  this.request = request;
  this.url = url;
  this.route = route;
  this.match = match;
  this.get = get;
  this.params = __getParams(route.path, match);
} as any as BunicornContextConstructor;

// Getters
__BunicornContext.prototype.getText = async function (
  this: __PrivateBunicornContext & { __text: string }
) {
  return (this.__text ??= await this.request.text());
};

__BunicornContext.prototype.getBody = async function (
  this: __PrivateBunicornContext & { __body: any; _route: Route }
) {
  // Cache body.
  if (this.__body) {
    return this.__body;
  }
  const route = this._route;
  const request = this.request;
  const contentType = request.headers.get("Content-Type") ?? "";
  let _body: any;

  if (contentType.includes("application/json")) {
    // TODO: Convert JSON.parse to global converter.
    _body = JSON.parse(await this.getText());
  } else if (contentType.includes("multipart/form-data")) {
    _body = await request
      .formData()
      .then(data => formDataToObject(data, route.input));
  } else {
    _body = await request.text();
  }

  if (!route.input) {
    return (this.__body = _body);
  }

  return (this.__body = __validate(route.input!, _body));
};

__BunicornContext.prototype.getSearchParams = function (
  this: __PrivateBunicornContext & { __searchParams: any },
  schema?: BunicornSchema
) {
  const result = (this.__searchParams ??= __getSearchParams(this.url));
  if (schema) {
    return __validate(schema, result);
  }
  return result;
};

__BunicornContext.prototype.getHeader = function (
  this: __PrivateBunicornContext,
  name: string
) {
  return this.request.headers.get(name);
};

// Setters
__BunicornContext.prototype.setHeader = function (
  this: __PrivateBunicornContext,
  name: string,
  value: string
) {
  this.resultHeaders ??= {};
  this.resultHeaders[name] = value;
};

// Responses
__BunicornContext.prototype.ok = function (this: __PrivateBunicornContext) {
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
>(this: __PrivateBunicornContext, body: T, init: BuniResponseInit = {}) {
  this.applyHeaders(init);
  return new Response(body, init) as unknown as T;
};

__BunicornContext.prototype.text = function (
  this: __PrivateBunicornContext,
  body: string,
  init: any = {}
) {
  init.headers ??= {};
  init.headers["Content-Type"] = "text/plain";
  this.applyHeaders(init);
  return new Response(body, init) as any;
};

__BunicornContext.prototype.json = function <T extends Record<any, any>>(
  this: __PrivateBunicornContext,
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
  this: __PrivateBunicornContext,
  body: ReadableStream<T>,
  init: BuniResponseInit = {}
) {
  init.headers ??= {};
  init.headers["Content-Type"] = "text/event-stream";
  this.applyHeaders(init);
  return new Response(body, init) as unknown as ReadableStream<T>;
};

// Helpers
__BunicornContext.prototype.applyHeaders = function (
  this: __PrivateBunicornContext,
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

export { __BunicornContext };
