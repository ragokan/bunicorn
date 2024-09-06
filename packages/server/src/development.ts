import { z } from "zod";
import { BunicornApp } from "./app/index.ts";
import staticHandler from "./handlers/static.ts";
import { RouteBuilder } from "./router/builder.ts";

const app = new BunicornApp({
	basePath: "/",
});

const rb = new RouteBuilder();

const c = new RouteBuilder()
	.input(z.object({ message: z.string() }))
	.post("/hello", async (ctx) => {
		const { message } = await ctx.getBody();
		return ctx.json({
			msg: `Hello ${message}!`,
		});
	});

const R = app
	.addHandler(staticHandler({ path: "/static", directory: "./src" }))
	.addRoutes([
		c,
		rb.output(z.string()).get("/", (ctx) => ctx.raw("Hello world!")),
		rb.get("/:id", (ctx) => ctx.json({ params: ctx.params })),
		rb.get("/hello", (ctx) => {
			return ctx.raw("Hello world!");
		}),

		rb.get("/...rest/:args", (ctx) => {
			console.log("params", ctx.params);
			console.log("search params", ctx.getSearchParams());
			return ctx.raw(`Hello world!${JSON.stringify(ctx.params)}`);
		}),
	]);

Bun.serve({
	fetch: R.handleRequest,
	port: 8000,
});

// eslint-disable-next-line no-console
console.log("Bun server is running on http://localhost:8000/");
