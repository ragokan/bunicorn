import type { BaseMiddleware } from "../middleware.ts";
import type { Route } from "./route.ts";

export type BasePath = `/${string}`;

export type __RemoveTrailingSlash<T extends BasePath> =
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

export type __SplitParams<
	S extends string,
	D extends string,
> = S extends `${infer T}${D}${infer R}` ? [T, ...__SplitParams<R, D>] : [S];

export type __ExtractParamsHelper<
	T extends string[],
	History extends Record<string, any> = {},
> = T extends [infer First, ...infer Rest]
	? First extends string
		? First extends `:${infer Param}`
			? __ExtractParamsHelper<
					Extract<Rest, string[]>,
					History & { [key in Param & string]: string }
				>
			: First extends `...${infer Param}`
				? __ExtractParamsHelper<
						Extract<Rest, string[]>,
						History & { [key in Param & string]: string[] }
					>
				: __ExtractParamsHelper<Extract<Rest, string[]>, History>
		: never
	: History;

export type __ExtractParams<
	Path extends string,
	History extends Record<string, any> = {},
> = __ExtractParamsHelper<__SplitParams<Path, "/">, History>;

export type __MergePaths<
	TBase extends BasePath,
	TNew extends BasePath,
> = __RemoveTrailingSlash<
	TBase extends "/"
		? TNew
		: `${__RemoveTrailingSlash<TBase>}${__RemoveTrailingSlash<TNew>}`
>;

export interface __BuiltRoute<TPath extends BasePath = BasePath>
	extends Route<TPath> {
	regexp?: RegExp;
	middlewares: BaseMiddleware<any>[];
}

export type BunicornResponse<Returns> = Response & { __brand: Returns };
