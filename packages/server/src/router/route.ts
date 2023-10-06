import {
  type BunicornSchema,
  type ValidateOptions
} from "../validation/types.ts";
import { type BaseMiddleware } from "../middleware.ts";
import { type BaseMethod, type BasePath, type MergePaths } from "./types.ts";

export interface Route<
  TPath extends BasePath = BasePath,
  TMethod extends BaseMethod = BaseMethod,
  TOutput extends BunicornSchema | any = any,
  TInput extends BunicornSchema | never = never
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
