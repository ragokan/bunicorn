import type {
  BaseMethod,
  BasePath,
  BunicornApp,
  BunicornSchema,
  __ExtractParams,
  __InferBunicornInput,
  Route
} from "@bunicorn/server";
import {
  BunicornError,
  BunicornNotFoundError,
  BunicornValidationError,
  createError
} from "@bunicorn/server";

function withoutTrailingSlash(path: string) {
  return path.endsWith("/") ? path.slice(0, -1) : path;
}
type ExtractPathsByMethod<
  TApp extends BunicornApp<any, any[]>,
  Method extends BaseMethod
> = TApp extends BunicornApp<any, infer Routes>
  ? Extract<Routes extends (infer R)[] ? R : never, { method: Method }>["path"]
  : never;

type FindRouteByPathAndMethod<
  TApp extends BunicornApp<any, any[]> = any,
  Path extends BasePath = any,
  Method extends BaseMethod = any
> = TApp extends BunicornApp<any, infer Routes>
  ? Extract<
      Routes extends (infer R)[] ? R : never,
      { path: Path; method: Method }
    >
  : never;

type NonEmptyKeys<T> = {
  [K in keyof T]: {} extends T[K]
    ? never
    : T[K] extends never
    ? never
    : T[K] extends undefined
    ? never
    : K;
}[keyof T];

type FilterNeverAndEmpty<T> = Pick<T, NonEmptyKeys<T>>;

type GetInputFromSchema<TSchema extends BunicornSchema | never> =
  TSchema extends BunicornSchema ? __InferBunicornInput<TSchema> : never;

type BaseConfig<TRoute extends Route<any, any, any, any>> =
  FilterNeverAndEmpty<{
    params: __ExtractParams<TRoute["path"]>;
    input: GetInputFromSchema<TRoute["input"]>;
  }> & {
    with?: Omit<RequestInit, "body" | "method">;
    query?: Record<string, string>;
  };

type Config<
  TRoute extends Route<any, any, any, any>,
  Config extends BaseConfig<any> = BaseConfig<TRoute>
> = Config extends { input: infer TInput }
  ? Omit<Config, "input"> & ({ input: TInput } | { formData: FormData })
  : Config;

interface ClientOptions {
  basePath: string;
  headers?: Record<string, string> | (() => Record<string, string>);
  onError?: (error: BunicornError) => void;
  onRequest?: (request: Request) => void;
  onResult?: (result: BunicornResult, response: Response) => void;
}

function hasParams(
  config: Config<any>
): config is Config<any> & { params: Record<string, string> } {
  return "params" in config;
}

function hasInput(config: Config<any>): config is Config<any> & { input: any } {
  return "input" in config;
}

function hasFormData(
  config: Config<any>
): config is Config<any> & { formData: FormData } {
  return "formData" in config;
}

export interface SuccessResult<T = any> {
  success: true;
  data: T;
  response: Response;
}

export interface FailureResult {
  success: false;
  error: BunicornError;
  response: Response;
}

export type BunicornResult<T = any> = SuccessResult<T> | FailureResult;

class BunicornPromise<
  TData,
  TResult extends BunicornResult<TData> = BunicornResult<TData>
> extends Promise<TResult> {
  public async assert() {
    const result = await this;
    if (result.success) {
      return result as SuccessResult<TData>;
    }
    throw result.error;
  }
}

export default function bunicornClient<App extends BunicornApp<any>>({
  headers,
  basePath,
  onError,
  onRequest,
  onResult
}: ClientOptions) {
  const getHeaders =
    typeof headers === "function" ? headers : () => headers ?? {};

  function handler(
    path: string,
    config: Config<any>,
    method: BaseMethod
  ): BunicornPromise<BunicornResult<any>, any> {
    return new BunicornPromise(async resolve => {
      let url = withoutTrailingSlash(basePath) + path;

      const init: RequestInit & { headers: Record<string, string> } =
        Object.assign(config.with ?? {}, {
          method,
          headers: Object.assign(getHeaders(), config.with?.headers ?? {})
        });
      if (config.query) {
        const query = new URLSearchParams(config.query);
        if (url.includes("?")) {
          const [urlWithoutQuery, urlQuery] = url.split("?");
          url = `${urlWithoutQuery}?${query.toString()}&${urlQuery}`;
        } else {
          url = `${url}?${query.toString()}`;
        }
      }
      if (hasParams(config)) {
        url = url.replace(/:(\w+)/g, (_, key) => {
          if (/^\d+$/.test(key)) {
            return `:${key}`;
          }
          return config.params[key] ?? `:${key}`;
        });
        url = url.replace(/\/\.\.\.(\w+)/g, (_, key) => {
          const params = config.params[key] as unknown as Array<string>;
          return params ? "/" + params.join("/") : `...${key}`;
        });
      }
      if (hasInput(config)) {
        const input = config.input;

        // For string, FormData, Blob and ReadableStream, we don't need to do anything to body
        if (
          typeof input === "string" ||
          input instanceof ReadableStream ||
          input instanceof Blob
        ) {
          init.body = input;
        } else {
          // Else, we need to stringify the body and set Content-Type to application/json
          init.body = JSON.stringify(input);
          init.headers["Content-Type"] = "application/json";
        }
      } else if (hasFormData(config)) {
        init.body = config.formData;
      }
      if (onRequest) {
        onRequest(new Request(url, init));
      }
      const response = await fetch(url, init);
      let data: any;
      const contentType = response.headers.get("content-type");
      if (!contentType) {
        data = response.statusText;
      } else if (contentType.includes("application/json")) {
        data = await response.json();
      } else if (contentType.includes("form-data")) {
        data = await response.formData();
      } else if (contentType.includes("stream")) {
        data = response.body;
      } else if (contentType.includes("text")) {
        data = await response.text();
      } else {
        data = await response.blob();
      }

      if (!response.ok) {
        const error = createError(
          data?.message ?? response.statusText,
          data?.data,
          response.status,
          data?.type ?? "default"
        );
        if (onError) {
          onError(error);
        }
        return resolve({
          success: false,
          error,
          response
        });
      }

      if (onResult) {
        onResult(data, response);
      }

      return resolve({ success: true, data, response });
    });
  }

  function get<
    TPath extends ExtractPathsByMethod<App, "GET">,
    TRoute extends FindRouteByPathAndMethod = FindRouteByPathAndMethod<
      App,
      TPath,
      "GET"
    >
  >(path: TPath, config: Config<TRoute>) {
    return handler(path, config, "GET") as BunicornPromise<
      NonNullable<TRoute["output"]>
    >;
  }

  function post<
    TPath extends ExtractPathsByMethod<App, "POST">,
    TRoute extends FindRouteByPathAndMethod = FindRouteByPathAndMethod<
      App,
      TPath,
      "POST"
    >
  >(path: TPath, config: Config<TRoute>) {
    return handler(path, config, "POST") as BunicornPromise<
      NonNullable<TRoute["output"]>
    >;
  }

  function put<
    TPath extends ExtractPathsByMethod<App, "PUT">,
    TRoute extends FindRouteByPathAndMethod = FindRouteByPathAndMethod<
      App,
      TPath,
      "PUT"
    >
  >(path: TPath, config: Config<TRoute>) {
    return handler(path, config, "PUT") as BunicornPromise<
      NonNullable<TRoute["output"]>
    >;
  }

  function patch<
    TPath extends ExtractPathsByMethod<App, "PATCH">,
    TRoute extends FindRouteByPathAndMethod = FindRouteByPathAndMethod<
      App,
      TPath,
      "PATCH"
    >
  >(path: TPath, config: Config<TRoute>) {
    return handler(path, config, "PATCH") as BunicornPromise<
      NonNullable<TRoute["output"]>
    >;
  }

  function _delete<
    TPath extends ExtractPathsByMethod<App, "DELETE">,
    TRoute extends FindRouteByPathAndMethod = FindRouteByPathAndMethod<
      App,
      TPath,
      "DELETE"
    >
  >(path: TPath, config: Config<TRoute>) {
    return handler(path, config, "DELETE") as BunicornPromise<
      NonNullable<TRoute["output"]>
    >;
  }

  function options<
    TPath extends ExtractPathsByMethod<App, "OPTIONS">,
    TRoute extends FindRouteByPathAndMethod = FindRouteByPathAndMethod<
      App,
      TPath,
      "OPTIONS"
    >
  >(path: TPath, config: Config<TRoute>) {
    return handler(path, config, "OPTIONS") as BunicornPromise<
      NonNullable<TRoute["output"]>
    >;
  }

  function head<
    TPath extends ExtractPathsByMethod<App, "HEAD">,
    TRoute extends FindRouteByPathAndMethod = FindRouteByPathAndMethod<
      App,
      TPath,
      "HEAD"
    >
  >(path: TPath, config: Config<TRoute>) {
    return handler(path, config, "HEAD") as BunicornPromise<
      NonNullable<TRoute["output"]>
    >;
  }

  const obj = { get, post, patch, put, options, head };
  (obj as any).delete = _delete;
  return obj as typeof obj & {
    delete: typeof _delete;
  };
}

export { BunicornError, BunicornNotFoundError, BunicornValidationError };
