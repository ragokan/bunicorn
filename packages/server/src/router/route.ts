import { type BaseMiddleware } from "../middleware.ts";
import { type BaseSchema } from "valibot";
import { type MergePaths, type BaseMethod, type BasePath } from "./types.ts";
import { type ValidateOptions } from "./builder.ts";

export interface Route<
  TPath extends BasePath = BasePath,
  TMethod extends BaseMethod = BaseMethod,
  TOutput extends BaseSchema | any = any,
  TInput extends BaseSchema | never = never
> {
  path: TPath;
  method: TMethod;
  handler(...args: any[]): any;
  middlewares?: BaseMiddleware[];
  input?: TInput;
  output?: TOutput;
  __inputOptions?: ValidateOptions;
  __outputOptions?: ValidateOptions;
}

export type AddBasePathTo<
  TRoute extends Route<any, any, any, any>,
  TBasePath extends BasePath
> = Omit<TRoute, "path"> & { path: MergePaths<TBasePath, TRoute["path"]> };

export type AddBasePathToAll<
  TRoutes extends Route<any, any, any, any>[],
  TBasePath extends BasePath
> = {
  [key in keyof TRoutes]: AddBasePathTo<TRoutes[key], TBasePath>;
};
