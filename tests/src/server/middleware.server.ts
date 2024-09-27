import { BunicornApp, Router, createMiddleware } from "@bunicorn/server";

export const loggerMiddleware = createMiddleware(async (_, next) => {
	console.log("Request received.");
	const response = await next();
	console.log("Response sent with body:", await response.clone().text());
	return response;
});

export const responseTimeMiddleware = createMiddleware(async (ctx, next) => {
	const start = Date.now();
	const response = await next();
	const time = Date.now() - start;
	console.log(`Response time for url ${ctx.req.url}: ${time}ms`);
	return response;
});

export const countMiddleware = createMiddleware(async () => {
	console.log("Count middleware called.");
	return { count: 3 };
});

export const ageMiddleware = createMiddleware(async () => {
	console.log("Age middleware called.");
	return { age: 5 };
});

const route = new Router()
	.use(responseTimeMiddleware)
	.use(loggerMiddleware)
	.use(countMiddleware)
	.use(ageMiddleware)
	.get("/", (ctx) => {
		console.log("Handler called.");
		return ctx.json({ message: `Hello World! ${ctx.count} ${ctx.age}` });
	});

export const app = new BunicornApp().addRoute(route);
export type AppType = typeof app;

export const startServer = (port: number) => app.serve({ port });
