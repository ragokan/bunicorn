import { readFile } from "fs/promises";
import { BunicornNotFoundError } from "../error/index.js";
import { mergePaths } from "../helpers/pathUtils.js";
import { matchAll } from "../matchers/constants.js";
import { type BasePath } from "../router/types.js";
import { createHandler } from "./index.js";
import { type BaseContext } from "../context/baseContext.js";

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
          const target = ctx.url.pathname.replace(finalPath, directory);
          if (!process.env.IS_BUN) {
            const file = await readFile(target);
            return new Response(file);
          } else {
            const file = Bun.file(target);
            const exists = await file.exists();
            if (!exists) {
              throw new BunicornNotFoundError();
            }
            return new Response(file);
          }
        } catch (_) {
          throw new BunicornNotFoundError();
        }
      }
    });
  });
}
