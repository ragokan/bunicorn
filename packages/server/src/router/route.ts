import {
  type BunicornSchema,
  type ValidateOptions
} from "../validation/types.js";
import { type BaseMiddleware } from "../middleware.js";
import { type BaseMethod, type BasePath, type MergePaths } from "./types.js";

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
  TBasePath extends BasePath,
  TRoute extends Route<any, any, any, any>
> = Omit<TRoute, "path"> & { path: MergePaths<TBasePath, TRoute["path"]> };

export type AddBasePathToAll<
  TBasePath extends BasePath,
  TRoutes extends Route<any, any, any, any>[]
> = {
  [key in keyof TRoutes]: AddBasePathTo<TBasePath, TRoutes[key]>;
};
