import { BunicornApp, createMiddleware } from "./index.ts";
import { cacheMiddleware } from "./middleware/cacheMiddleware.ts";
import { Router } from "./router/base.ts";

const loggerMiddleware = createMiddleware(async (_, next) => {
	console.log("Request received.");
	const response = await next();
	// If you use "response", you need to clone it before using it.
	console.log("Response sent with body:", await response.clone().text());
	return response;
});

const countMiddleware = createMiddleware(async () => {
	console.log("Count middleware called.");
	return { count: 3 };
});

const ageMiddleware = createMiddleware(async () => {
	console.log("Age middleware called.");
	return { age: 5 };
});

const route = new Router()
	.use(loggerMiddleware)
	.use(cacheMiddleware({ by: (ctx) => ctx.req.url }))
	.use(countMiddleware)
	.use(ageMiddleware)
	.get("/", (ctx) => {
		console.log("Handler called.");
		return ctx.json({ message: `Hello World! ${ctx.count} ${ctx.age}` });
	});

const app = new BunicornApp().addRoute(route);

app.serve({
	port: 8080,
});
console.log("Server started on http://localhost:8080/");
