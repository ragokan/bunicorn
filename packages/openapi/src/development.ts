import { BunicornApp, RouteBuilder } from "@bunicorn/server";
import staticHandler from "@bunicorn/server/staticHandler";
import { z } from "zod";

const app = new BunicornApp({
	basePath: "/api",
});

const rb = new RouteBuilder();

const postHelloMessage = new RouteBuilder()
	.input(z.object({ message: z.string() }))
	.output(z.object({ msg: z.string() }))
	.post("/hello/...rest", async (ctx) => {
		const { message } = await ctx.getBody();
		return ctx.json({
			msg: `Hello ${message}!`,
		});
	});

const defaultRoute = rb
	.output(z.string())
	.get("/", (ctx) => ctx.raw("Hello world!"));

const getHelloRoute = rb.output(z.string()).get("/hello/:id/:xyz", (ctx) => {
	return ctx.raw("Hello world!");
});

const R = app
	.addHandler(staticHandler({ path: "/static", directory: "./src" }))
	.addRoutes([postHelloMessage, defaultRoute, getHelloRoute]);

R.serve();
