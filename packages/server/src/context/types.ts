import { type GetDependencyFn } from "../helpers/di.js";
import { type BasePath, type BuiltRoute } from "../router/types.js";

export interface CreateContextArgs<TPath extends BasePath> {
  route: BuiltRoute<TPath>;
  request: Request;
  use: GetDependencyFn;
  match: string[];
  url: string;
}
