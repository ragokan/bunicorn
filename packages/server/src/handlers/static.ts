import { readFile } from "fs/promises";
import { BunicornNotFoundError } from "../error/index.ts";
import { mergePaths } from "../helpers/pathUtils.ts";
import { matchAll } from "../matchers/constants.ts";
import { type BasePath } from "../router/types.ts";
import { createHandler } from "./index.ts";
import { type BaseContext } from "../context/baseContext.ts";
import { __getPath } from "../helpers/pathRegexps.ts";

export interface StaticHandlerArgs {
  path: BasePath;
  directory: string;
}
export default function staticHandler({ path, directory }: StaticHandlerArgs) {
  return createHandler(app => {
    const finalPath = mergePaths(app.args.basePath, path);
    app.routes["GET"].push({
      path: finalPath,
      method: "GET",
      middlewares: [],
      regexp: new RegExp(`^${finalPath}/${matchAll}`),
      async handler(ctx: BaseContext) {
        try {
          const target = __getPath(ctx.url).replace(finalPath, directory);
          if (IS_BUN) {
            const file = Bun.file(target);
            const exists = await file.exists();
            if (!exists) {
              throw new BunicornNotFoundError();
            }
            return new Response(file);
          } else {
            const file = await readFile(target);
            return new Response(file);
          }
        } catch (_) {
          throw new BunicornNotFoundError();
        }
      }
    });
  });
}
