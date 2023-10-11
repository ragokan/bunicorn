import { BunicornError } from "../error/index.ts";
import { validate } from "../validation/validate.ts";
import { BunicornApp } from "../app/index.ts";
import { getParams } from "../helpers/pathUtils.ts";
import { type BasePath } from "../router/types.ts";
import { type BaseContext } from "./baseContext.ts";
import { type CreateContextArgs } from "./types.ts";

export function createContext<TPath extends BasePath = BasePath>({
  get,
  request,
  match,
  route,
  url
}: CreateContextArgs<TPath>) {
  const params = getParams(route.path, match);

  // Setters
  const resultHeaders: Record<string, string> = {};

  function setHeader(name: string, value: string) {
    resultHeaders[name] = value;
  }

  // Return types
  function raw<
    T extends
      | ReadableStream
      | BlobPart
      | BlobPart[]
      | FormData
      | URLSearchParams
      | null
  >(body: T, init: ResponseInit = {}) {
    init.headers = Object.assign(resultHeaders, init.headers ?? {});
    return new Response(body, init) as unknown as T;
  }

  function json(body: any, init: ResponseInit = {}) {
    init.headers = Object.assign(
      resultHeaders,
      { "Content-Type": "application/json" },
      init.headers ?? {}
    );

    if (route.output) {
      try {
        const parseResult = validate(route.output, body, route.__outputOptions);
        return new Response(JSON.stringify(parseResult), init) as any;
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

    return new Response(JSON.stringify(body), init) as any;
  }

  function ok() {
    return new Response(undefined, {
      status: 200,
      headers: resultHeaders
    }) as any;
  }

  function text(body: string, init: ResponseInit = {}) {
    init.headers = Object.assign(
      resultHeaders,
      { "Content-Type": "text/plain" },
      init.headers ?? {}
    );
    return new Response(body, init) as unknown as string;
  }

  function stream<T>(body: ReadableStream<T>, init: ResponseInit = {}) {
    init.headers = Object.assign(
      resultHeaders,
      { "Content-Type": "text/event-stream" },
      init.headers ?? {}
    );
    return new Response(body, init) as unknown as T;
  }

  return {
    // Setters
    setHeader,
    // Response
    ok,
    raw,
    text,
    json,
    stream,
    // Helpers and params
    get,
    params,
    request,
    url
  } as BaseContext<TPath, any>;
}
