import {
  type __InferBunicornOutput,
  type BunicornSchema
} from "../validation/types.ts";
import { type GetDependencyFn } from "../helpers/di.ts";
import { type BasePath, type __ExtractParams } from "../router/types.ts";

export interface BaseContext<
  TPath extends BasePath = BasePath,
  InputSchema extends BunicornSchema | never = never
> {
  // Helpers
  params: __ExtractParams<TPath>;
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

  [__schemaBrand]: InputSchema;
}

declare const __schemaBrand: unique symbol;

export type __GetContextInput<TContext extends BaseContext | object> =
  TContext extends { [__schemaBrand]: infer T }
    ? __InferBunicornOutput<T>
    : never;
