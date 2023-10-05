import { BunicornApp } from "../app/index.js";
import { safeParse } from "valibot";
import { getParams } from "../helpers/pathUtils.js";
import { type BasePath } from "../router/types.js";
import { type BaseContext } from "./baseContext.js";
import { type CreateContextArgs } from "./types.js";
import { bunicornError } from "./helpers.js";

export function createContext<TPath extends BasePath = BasePath>({
  use,
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
    if (route.output) {
      const parseResult = safeParse(route.output, body, route.__outputOptions);
      if (parseResult.success) {
        body = parseResult.output;
      } else {
        BunicornApp.onGlobalError(
          bunicornError(
            `Failed to parse output for the method '${route.method}' to path '${route.path}'.`,
            {
              data: {
                path: route.path,
                output: body,
                schema: route.output,
                issues: parseResult.issues
              }
            }
          )
        );
        throw bunicornError(
          "Failed to parse output. This should be handled internally."
        );
      }
    }
    init.headers = Object.assign(
      resultHeaders,
      { "Content-Type": "application/json" },
      init.headers ?? {}
    );
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
    use,
    params,
    request,
    url
  } as BaseContext<TPath, any>;
}
