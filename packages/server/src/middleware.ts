import { type BunicornContext } from "./context/types.ts";
import { type BasePath } from "./router/types.ts";

export type BaseMiddleware<TPath extends BasePath = BasePath, TResult = any> = (
  ctx: BunicornContext<TPath>
) => TResult | Promise<TResult>;

export function createMiddleware<TResult>(
  cb: (context: BunicornContext) => TResult
) {
  return cb;
}
