import { type BaseContext } from "./context/baseContext.ts";
import { type BasePath } from "./router/types.ts";

export type BaseMiddleware<TPath extends BasePath = BasePath, TResult = any> = (
  ctx: BaseContext<TPath>
) => TResult | Promise<TResult>;

export function createMiddleware<TResult>(
  cb: (context: BaseContext) => TResult
) {
  return cb;
}
