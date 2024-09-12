import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import bunicornClient, {
	BunicornError,
	BunicornNotFoundError,
	BunicornValidationError,
} from "@bunicorn/client";
import type { Server } from "bun";
import { type AppType, app } from "./crud/server.ts";

function assert(value: unknown, message?: string): asserts value;
function assert(value: unknown, message?: string) {
	if (!value) {
		throw new Error(message ?? "Assertion failed");
	}
}

let server: Server;
// @ts-ignore
beforeAll(async () => {
	server = app.serve({ port: 8000 });
});

afterAll(() => {
	server.stop(true);
});

describe("api tests", () => {
	let giveToken = false;
	const client = bunicornClient<AppType>({
		basePath: "http://localhost:8000",
		headers: () => {
			const headers: Record<string, string> = {};
			if (giveToken) {
				headers["x-token"] = "123";
			}
			return headers;
		},
	});

	it("header tests", async () => {
		const r1 = await client.get("/api/todos", {});
		expect(r1.success).toBe(false);
		assert(r1.success === false);
		expect(r1.error).toBeInstanceOf(BunicornError);
		expect(r1.error.message).toBe("Unique token is required");
		expect(r1.error.status).toBe(401);
		expect(r1.response.status).toBe(401);

		giveToken = true;
		const r2 = await client.get("/api/todos", {}).assert();
		expect(r2.success).toBe(true);
		expect(r2.response.status).toBe(200);
		expect(r2.data).toEqual([]);
		expect(r2.response.headers.get("content-type")).toStartWith(
			"application/json",
		);
	});

	let todoId: number;

	it("validation", async () => {
		// as any to avoid type error, because we want to get error
		const r1 = await client.post("/api/todos", { input: {} as any });
		assert(r1.success === false);
		expect(r1.error).toBeInstanceOf(BunicornValidationError);
		expect(r1.error.message).toBe("Validation Error");
		expect(r1.error.status).toBe(403);
		expect(r1.response.status).toBe(403);
		assert(r1.error instanceof BunicornValidationError);
		expect(r1.error.data).toBeArray();
		expect(r1.error.data).toHaveLength(1);
		expect(r1.error.data![0]).toEqual({
			message: "Required",
			validation: "invalid_type",
			path: ["title"],
		});

		const r2 = await client.post("/api/todos", {
			input: { title: "Hello world!" },
		});
		expect(r2.success).toBe(true);
		expect(r2.response.status).toBe(201);
		assert(r2.success);
		expect(r2.data.id).toBeNumber();
		todoId = r2.data.id;
		expect(r2.data.title).toBe("Hello world!");
		expect(r2.data.completed).toBe(false);
	});

	it("get tests", async () => {
		const r1 = await client
			.get("/api/todos/:id", {
				params: { id: todoId.toString() },
			})
			.assert();

		expect(r1.success).toBe(true);
		expect(r1.response.status).toBe(200);
		expect(r1.data).toEqual({
			id: todoId,
			title: "Hello world!",
			completed: false,
		});

		const r2 = await client.get("/api/todos/:id", {
			params: { id: "-1" },
		});
		expect(r2.success).toBe(false);
		assert(r2.success === false);
		expect(r2.error).toBeInstanceOf(BunicornNotFoundError);
		expect(r2.error.message).toBe("Todo not found");
		expect(r2.error.status).toBe(404);
		expect(r2.response.status).toBe(404);

		const r3 = await client.get("/api/todos", {}).assert();
		expect(r3.success).toBe(true);
		expect(r3.response.status).toBe(200);
		expect(r3.data).toBeArray();
		expect(r3.data).toHaveLength(1);
		expect(r3.data.at(0)).toEqual({
			id: todoId,
			title: "Hello world!",
			completed: false,
		});
		expect(r3.response.headers.get("content-type")).toStartWith(
			"application/json",
		);
	});
});
