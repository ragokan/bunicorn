import { BunicornApp, RouteBuilder, groupRoutes } from "@bunicorn/server";
import staticHandler from "@bunicorn/server/staticHandler";
import * as v from "valibot";
import openApiHandler from "./index.ts";

const app = new BunicornApp({
	basePath: "/api",
});

const rb = new RouteBuilder();

const getHelloMessage = rb
	.output(v.object({ msg: v.string() }))
	.get("/:name", async (ctx) => {
		return ctx.json({
			msg: `Hello ${ctx.params.name}!`,
		});
	});

const postHelloMessage = new RouteBuilder()
	.input(v.object({ message: v.string() }))
	.output(v.object({ msg: v.string() }))
	.meta({ auth: true })
	.post("/", async (ctx) => {
		console.log(ctx.getHeader("Authorization"));
		const { message } = await ctx.getBody();
		return ctx.json({
			msg: `Hello ${message}!`,
		});
	});

const helloRoutes = groupRoutes("/hello", [getHelloMessage, postHelloMessage], {
	group: "Hello",
});

const defaultRoute = rb
	.output(v.string())
	.get("/", (ctx) => ctx.raw("Hello world!"));

const R = app
	.addHandler(staticHandler({ path: "/static", directory: "./src" }))
	.addRoutes([defaultRoute])
	.addRoutes(helloRoutes);

await R.addAsyncHandler(
	openApiHandler({ apiUrl: "http://localhost:8000", title: "Development API" }),
);

console.log(R.staticRoutes);

R.serve({ port: 8000 });
console.log("Server running on http://localhost:8000");
