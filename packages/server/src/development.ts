import { BunicornApp, createMiddleware } from "./index.ts";
import { cacheMiddleware } from "./middleware/cache/index.ts";
import { Router } from "./router/base.ts";

const loggerMiddleware = createMiddleware(async (_, next) => {
	console.log("Request received.");
	const response = await next();
	// If you use "response", you need to clone it before using it.
	console.log("Response sent with body:", await response.clone().text());
	return response;
});

const responseTimeMiddleware = createMiddleware(async (ctx, next) => {
	const start = Date.now();
	const response = await next();
	const time = Date.now() - start;
	console.log(`Response time for url ${ctx.req.url}: ${time}ms`);
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
	.use(responseTimeMiddleware)
	.use(loggerMiddleware)
	.use(cacheMiddleware({ getKey: (ctx) => ctx.req.url }))
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
