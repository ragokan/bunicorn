import { type GetDependencyFn } from "../helpers/di.ts";
import {
  type BasePath,
  type __BuiltRoute,
  type __ExtractParams
} from "../router/types.ts";

import {
  type BunicornSchema,
  type __InferBunicornOutput
} from "../validation/types.ts";

export interface __CreateContextArgs<TPath extends BasePath> {
  route: __BuiltRoute<TPath>;
  request: Request;
  get: GetDependencyFn;
  match: string[] | boolean;
  url: string;
}

export interface BuniResponseInit {
  headers?: Record<string, string>;
  /** @default 200 */
  status?: number | bigint;

  /** @default "OK" */
  statusText?: string;
}

export interface BunicornContext<
  TPath extends BasePath = BasePath,
  InputSchema = never
> {
  // Base
  request: Request;
  url: TPath;
  route: __BuiltRoute<TPath>;
  match: string[] | boolean;
  get: GetDependencyFn;
  params: __ExtractParams<TPath>;

  // Getters
  getText(): Promise<string>;
  getBody(): Promise<InputSchema>;
  getSearchParams<Body extends Record<string, string>>(): Body;
  getSearchParams<TSchema extends BunicornSchema>(
    schema: TSchema
  ): __InferBunicornOutput<TSchema>;
  getHeader(name: string): string | null;

  // Setters
  setHeader(name: string, value: string): void;

  // Responses
  ok(): any;
  raw<T>(body: T, init?: BuniResponseInit): T;
  text(body: string, init?: BuniResponseInit): string;
  json<T>(body: T, init?: BuniResponseInit): T;
  stream<T>(
    body: ReadableStream<T>,
    init?: BuniResponseInit
  ): ReadableStream<T>;
}

export interface __PrivateBunicornContext<
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
