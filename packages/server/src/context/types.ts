import { type GetDependencyFn } from "../helpers/di.ts";
import { type BasePath, type BuiltRoute } from "../router/types.ts";

export interface CreateContextArgs<TPath extends BasePath> {
  route: BuiltRoute<TPath>;
  request: Request;
  use: GetDependencyFn;
  match: RegExpMatchArray;
  url: URL;
}
