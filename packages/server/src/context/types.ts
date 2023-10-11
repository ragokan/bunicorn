import { type GetDependencyFn } from "../helpers/di.ts";
import { type BasePath, type BuiltRoute } from "../router/types.ts";

export interface CreateContextArgs<TPath extends BasePath> {
  route: BuiltRoute<TPath>;
  request: Request;
  get: GetDependencyFn;
  match: string[] | boolean;
  url: string;
}
