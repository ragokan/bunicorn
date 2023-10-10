import {
  type InferBunicornOutput,
  type BunicornSchema
} from "../validation/types.ts";
import { type GetDependencyFn } from "../helpers/di.ts";
import { type BasePath, type ExtractParams } from "../router/types.ts";

export interface BaseContext<
  TPath extends BasePath = BasePath,
  InputSchema extends BunicornSchema | never = never
> {
  // Helpers
  params: ExtractParams<TPath>;
  request: Request;
  get: GetDependencyFn;
  // The url requested
  url: string;
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
