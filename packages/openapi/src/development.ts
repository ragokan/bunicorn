import { BunicornApp, Router, groupRoutes } from "@bunicorn/server";
import * as v from "valibot";
import openApiHandler from "./index.ts";

const baseApp = new BunicornApp({
	basePath: "/api",
});

const rb = new Router();

const getHelloMessage = rb
	.output(v.object({ msg: v.string() }))
	.get("/:name", async (ctx) => {
		return ctx.json({
			msg: `Hello ${ctx.params.name}!`,
		});
	});

const postHelloMessage = new Router()
	.input(v.object({ message: v.string() }))
	.output(v.object({ msg: v.string() }))
	.meta({ auth: true })
	.post("/", async (ctx) => {
		console.log(ctx.req.headers.get("Authorization"));
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

const app = baseApp.addRoutes([defaultRoute]).addRoutes(helloRoutes);

await app.addAsyncHandler(
	openApiHandler({
		apiUrl: "http://localhost:8000",
		title: "Development API",
		onDocument(document) {
			console.log(document);
		},
	}),
);

app.serve({ port: 8000 });
console.log("Server running on http://localhost:8000");
