import type { BaseMiddleware } from "../middleware.ts";
import type { BunicornSchema, __ValidateOptions } from "../validation/types.ts";
import type { BaseMethod, BasePath, __MergePaths } from "./types.ts";

export interface Route<
	TPath extends BasePath = BasePath,
	TMethod extends BaseMethod = BaseMethod,
	TOutput extends BunicornSchema | any = any,
	TInput extends BunicornSchema | never = never,
> {
	path: TPath;
	method: TMethod;
	handler(...args: any[]): any;
	middlewares?: BaseMiddleware[];
	input?: TInput;
	output?: TOutput;
	__inputOptions?: __ValidateOptions;
	__outputOptions?: __ValidateOptions;
}

export type __AddBasePathTo<
	TBasePath extends BasePath,
	TRoute extends Route<any, any, any, any>,
> = TRoute extends Route<
	infer TRoutePath,
	infer TRouteMethod,
	infer TOutput,
	infer TInput
>
	? Route<__MergePaths<TBasePath, TRoutePath>, TRouteMethod, TOutput, TInput>
	: never;

export type __AddBasePathToAll<
	TBasePath extends BasePath,
	TRoutes extends Route<any, any, any, any>[],
> = {
	[key in keyof TRoutes]: __AddBasePathTo<TBasePath, TRoutes[key]>;
};
