import {
	type Mock,
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	jest,
} from "bun:test";
import bunicornClient from "@bunicorn/client";
import { BunicornApp, Router, createMiddleware } from "@bunicorn/server";
import { type AppType, startServer } from "./server/middleware.server.ts";

// Mock console.log
const mockConsoleLog = jest.fn();
console.log = mockConsoleLog as Mock<any>;

describe("Middleware Tests", () => {
	let server: any;
	const client = bunicornClient<AppType>({
		serverPath: "http://localhost:8080",
	});

	beforeEach(() => {
		server = startServer(8080);
		mockConsoleLog.mockClear();
	});

	afterEach(() => {
		server.stop(true);
	});

	it("should call all middlewares and handler exactly once in correct order", async () => {
		const response = await client.get("/", {}).assert();

		expect(response.success).toBe(true);
		expect(response.data).toEqual({ message: "Hello World! 3 5" });

		expect(mockConsoleLog.mock.calls).toEqual([
			["Request received."],
			["Count middleware called."],
			["Age middleware called."],
			["Handler called."],
			["Response sent with body:", '{"message":"Hello World! 3 5"}'],
			[
				expect.stringMatching(
					/Response time for url http:\/\/localhost:8080\/: \d+ms/,
				),
			],
		]);

		// Check that each middleware and handler is called exactly once
		const callCounts = mockConsoleLog.mock.calls.reduce(
			(acc, call) => {
				acc[call[0]] = (acc[call[0]] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

		expect(callCounts["Request received."]).toBe(1);
		expect(callCounts["Count middleware called."]).toBe(1);
		expect(callCounts["Age middleware called."]).toBe(1);
		expect(callCounts["Handler called."]).toBe(1);
		expect(
			Object.keys(callCounts).find((key) =>
				key.startsWith("Response time for url"),
			),
		).toBeTruthy();
		expect(
			Object.keys(callCounts).find((key) =>
				key.startsWith("Response sent with body"),
			),
		).toBeTruthy();
	});

	it("should handle errors in middlewares", async () => {
		const errorMiddleware = createMiddleware(async () => {
			throw new Error("Test error");
		});

		const errorRoute = new Router()
			.use(errorMiddleware)
			.get("/error", (ctx) => {
				return ctx.json({ message: "This should not be reached" });
			});

		const errorApp = new BunicornApp().addRoute(errorRoute);
		const errorServer = errorApp.serve({ port: 8081 });
		const errorClient = bunicornClient<typeof errorApp>({
			serverPath: "http://localhost:8081",
		});

		try {
			await errorClient.get("/error", {});
		} catch (error: any) {
			expect(error.message).toBe("Test error");
		}

		errorServer.stop(true);
	});

	it("should modify response in middleware", async () => {
		const modifyResponseMiddleware = createMiddleware(async (_, next) => {
			const response = await next();
			const json = await response.clone().json();
			json.modified = true;
			return new Response(JSON.stringify(json), response);
		});

		const modifyRoute = new Router()
			.use(modifyResponseMiddleware)
			.get("/modify", (ctx) => {
				return ctx.json({ message: "Original response" });
			});

		const modifyApp = new BunicornApp().addRoute(modifyRoute);
		const modifyServer = modifyApp.serve({ port: 8082 });
		const modifyClient = bunicornClient<typeof modifyApp>({
			serverPath: "http://localhost:8082",
		});

		const response = await modifyClient.get("/modify", {}).assert();

		expect(response.success).toBe(true);
		expect(response.data).toContainKey("modified");
		expect(response.data as unknown).toEqual({
			message: "Original response",
			modified: true,
		});

		modifyServer.stop(true);
	});

	it("should ensure middlewares are not called for non-existent routes", async () => {
		await client.get("/non-existent" as any, {}).catch(() => {});

		expect(mockConsoleLog.mock.calls).toEqual([]);

		// Ensure other middlewares and handler were not called
		expect(
			mockConsoleLog.mock.calls.every(
				(call) => !call[0].includes("Count middleware called."),
			),
		).toBe(true);
		expect(
			mockConsoleLog.mock.calls.every(
				(call) => !call[0].includes("Age middleware called."),
			),
		).toBe(true);
		expect(
			mockConsoleLog.mock.calls.every(
				(call) => !call[0].includes("Handler called."),
			),
		).toBe(true);
	});
});
