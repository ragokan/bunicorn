import {
  type InferBunicornOutput,
  type BunicornSchema
} from "../validation/types.js";
import { type GetDependencyFn } from "../helpers/di.js";
import { type BasePath, type ExtractParams } from "../router/types.js";

export interface BaseContext<
  TPath extends BasePath = BasePath,
  InputSchema extends BunicornSchema | never = never
> {
  // Helpers
  params: ExtractParams<TPath>;
  request: Request;
  get: GetDependencyFn;
  url: URL;
  // For response
  setHeader(name: string, value: string): void;
  // Response types
  ok(): undefined;
  text(body: string, init?: ResponseInit): string;
  json<T>(body: T, init?: ResponseInit): T;
  raw<T extends BlobPart | BlobPart[] | FormData | URLSearchParams | null>(
    body: T,
    init?: ResponseInit
  ): T;
  stream<T>(body: ReadableStream<T>, init?: ResponseInit): ReadableStream<T>;

  [_schemaBrand]: InputSchema;
}

declare const _schemaBrand: unique symbol;

export type GetContextInput<TContext extends BaseContext | object> =
  TContext extends { [_schemaBrand]: infer T } ? InferBunicornOutput<T> : never;
