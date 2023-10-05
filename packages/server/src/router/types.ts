import { type BaseMiddleware } from "../middleware.ts";
import { type Route } from "./route.ts";

export type BasePath = `/${string}`;

export type RemoveTrailingSlash<T extends BasePath> =
  T extends `/${infer Path}/` ? `/${Path}` : T;

export type BaseMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "ALL"
  | "HEAD";

type Split<
  S extends string,
  D extends string
> = S extends `${infer T}${D}${infer R}` ? [T, ...Split<R, D>] : [S];

type ExtractParamsHelper<
  T extends string[],
  History extends Record<string, any> = {}
> = T extends [infer First, ...infer Rest]
  ? First extends string
    ? First extends `:${infer Param}`
      ? ExtractParamsHelper<
          Extract<Rest, string[]>,
          History & { [key in Param & string]: string }
        >
      : First extends `...${infer Param}`
      ? ExtractParamsHelper<
          Extract<Rest, string[]>,
          History & { [key in Param & string]: string[] }
        >
      : ExtractParamsHelper<Extract<Rest, string[]>, History>
    : never
  : History;

export type ExtractParams<
  Path extends string,
  History extends Record<string, any> = {}
> = ExtractParamsHelper<Split<Path, "/">, History>;

export type MergePaths<
  TBase extends BasePath,
  TNew extends BasePath
> = TBase extends "/"
  ? TNew
  : `${RemoveTrailingSlash<TBase>}${RemoveTrailingSlash<TNew>}`;

export interface BuiltRoute<TPath extends BasePath = BasePath>
  extends Route<TPath> {
  regexp: RegExp;
  middlewares: BaseMiddleware<any>[];
}
