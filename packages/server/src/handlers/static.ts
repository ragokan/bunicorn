import type { BunicornContext } from "../context/base.ts";
import { HttpNotFoundError } from "../error/index.ts";
import { __getPath } from "../helpers/pathRegexps.ts";
import { __mergePaths } from "../helpers/pathUtils.ts";
import { restPath } from "../matchers/constants.ts";
import type { BasePath } from "../router/types.ts";
import { type Handler, createHandler } from "./index.ts";

export interface StaticHandlerArgs {
	path: BasePath;
	directory: string;
}
export default function staticHandler({
	path,
	directory,
}: StaticHandlerArgs): Handler {
	return createHandler((app) => {
		const finalPath = __mergePaths(app.args.basePath, path);
		app.addRoute({
			path: `/${finalPath}/${restPath}`,
			method: "GET",
			meta: { hidden: true },
			async handler(ctx: BunicornContext) {
				try {
					const target = __getPath(ctx.url).replace(finalPath, directory);
					if ("Bun" in globalThis) {
						const file = Bun.file(target);
						const exists = await file.exists();
						if (!exists) {
							throw new HttpNotFoundError();
						}
						return new Response(file);
					}
					if ("Deno" in globalThis) {
						// @ts-expect-error Deno is not defined
						const file = await Deno.open(target, { read: true });
						return new Response(file.readable);
					}
					const readFile = await import("node:fs/promises").then(
						(mod) => mod.readFile,
					);
					const file = await readFile(target);
					return new Response(file);
				} catch (_) {
					throw new HttpNotFoundError();
				}
			},
		});
	});
}
