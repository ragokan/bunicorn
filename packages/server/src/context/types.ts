import { type GetDependencyFn } from "../helpers/di.ts";
import { type BasePath, type __BuiltRoute } from "../router/types.ts";

export interface __CreateContextArgs<TPath extends BasePath> {
  route: __BuiltRoute<TPath>;
  request: Request;
  get: GetDependencyFn;
  match: string[] | boolean;
  url: string;
}

export interface BuniResponseInit {
  headers?: Record<string, string>;
  /** @default 200 */
  status?: number | bigint;

  /** @default "OK" */
  statusText?: string;
}
