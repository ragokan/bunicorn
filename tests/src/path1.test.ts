import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import bunicornClient, {
	BunicornError,
	BunicornNotFoundError,
	BunicornValidationError,
} from "@bunicorn/client";
import type { Server } from "bun";
import { type AppType, app } from "./server/path1.server.ts";

function assert(value: unknown, message?: string): asserts value;
function assert(value: unknown, message?: string) {
	if (!value) {
		throw new Error(message ?? "Assertion failed");
	}
}

let server: Server;
beforeAll(async () => {
	server = app.serve({ port: 8101 });
});

afterAll(() => {
	server.stop(true);
});

describe("path1 api tests", () => {
	let apiKey = "";
	const client = bunicornClient<AppType>({
		serverPath: "http://localhost:8101",
		headers: () => ({
			"x-api-key": apiKey,
		}),
	});

	it("should require API key", async () => {
		const r = await client.get("/api/v1/users", {});
		expect(r.success).toBe(false);
		assert(r.success === false);
		expect(r.error).toBeInstanceOf(BunicornError);
		expect(r.error.message).toBe("Invalid API key");
		expect(r.error.status).toBe(401);
	});

	it("should get empty users list", async () => {
		apiKey = "secret-key";
		const r = await client.get("/api/v1/users", {}).assert();
		expect(r.success).toBe(true);
		expect(r.data).toEqual([]);
	});

	it("should create a user", async () => {
		const r = await client
			.post("/api/v1/users", {
				input: { name: "John Doe", email: "john@example.com" },
			})
			.assert();
		expect(r.success).toBe(true);
		expect(r.data.name).toBe("John Doe");
		expect(r.data.email).toBe("john@example.com");
		expect(r.data.id).toBeNumber();
	});

	it("should get users list with one user", async () => {
		const r = await client.get("/api/v1/users", {}).assert();
		expect(r.success).toBe(true);
		expect(r.data).toHaveLength(1);
		expect(r.data[0]!.name).toBe("John Doe");
	});

	it("should get a single user", async () => {
		const users = await client.get("/api/v1/users", {}).assert();
		const userId = users.data[0]!.id;
		const r = await client
			.get("/api/v1/users/:id", { params: { id: userId.toString() } })
			.assert();
		expect(r.success).toBe(true);
		expect(r.data.name).toBe("John Doe");
	});

	it("should update a user", async () => {
		const users = await client.get("/api/v1/users", {}).assert();
		const userId = users.data[0]!.id;
		const r = await client
			.put("/api/v1/users/:id", {
				params: { id: userId.toString() },
				input: { name: "Jane Doe" },
			})
			.assert();
		expect(r.success).toBe(true);
		expect(r.data.name).toBe("Jane Doe");
		expect(r.data.email).toBe("john@example.com");
	});

	it("should partially update a user", async () => {
		const users = await client.get("/api/v1/users", {}).assert();
		const userId = users.data[0]!.id;
		const r = await client
			.patch("/api/v1/users/:id", {
				params: { id: userId.toString() },
				input: { email: "jane@example.com" },
			})
			.assert();
		expect(r.success).toBe(true);
		expect(r.data.name).toBe("Jane Doe");
		expect(r.data.email).toBe("jane@example.com");
	});

	it("should delete a user", async () => {
		const users = await client.get("/api/v1/users", {}).assert();
		const userId = users.data[0]!.id;
		const r = await client
			.delete("/api/v1/users/:id", { params: { id: userId.toString() } })
			.assert();
		expect(r.success).toBe(true);
		expect(r.data.success).toBe(true);
	});

	it("should return 404 for non-existent user", async () => {
		const r = await client.get("/api/v1/users/:id", { params: { id: "999" } });
		expect(r.success).toBe(false);
		assert(r.success === false);
		expect(r.error).toBeInstanceOf(BunicornNotFoundError);
		expect(r.error.message).toBe("User not found");
	});

	it("should handle OPTIONS request", async () => {
		const r = await client.options("/api/v1/users", {}).assert();
		expect(r.success).toBe(true);
		expect(r.response.headers.get("Allow")).toBe(
			"GET, POST, PUT, DELETE, OPTIONS",
		);
	});

	it("should handle HEAD request", async () => {
		await client
			.post("/api/v1/users", {
				input: { name: "Test User", email: "test@example.com" },
			})
			.assert();
		const r = await client.head("/api/v1/users", {}).assert();
		expect(r.success).toBe(true);
		expect(r.response.headers.get("X-Total-Count")).toBe("1");
	});

	it("should echo request body for ALL method", async () => {
		const r = await client
			// @ts-expect-error - ALL method is not defined in the API
			.post("/api/v1/echo", { input: "Hello, World!" })
			.assert();
		expect(r.success).toBe(true);
		// @ts-expect-error - data is not defined in the response
		expect(r.data).toBe("Echoed: Hello, World!");
	});

	it("should validate user input", async () => {
		const r = await client.post("/api/v1/users", {
			// @ts-expect-error - missing required email field
			input: { name: "Invalid User" },
		});
		expect(r.success).toBe(false);
		assert(r.success === false);
		expect(r.error).toBeInstanceOf(BunicornValidationError);
		expect(r.error.message).toBe("Validation Error");
	});

	it("should handle concurrent requests", async () => {
		const promises = Array.from({ length: 5 }, () =>
			client.post("/api/v1/users", {
				input: { name: "Concurrent User", email: "concurrent@example.com" },
			}),
		);
		const results = await Promise.all(promises);
		expect(results).toHaveLength(5);
		results.forEach((r) => {
			expect(r.success).toBe(true);
			assert(r.success === true);
			expect(r.data.name).toBe("Concurrent User");
		});
	});

	it("should handle large payload", async () => {
		const largeName = "a".repeat(1000);
		const r = await client
			.post("/api/v1/users", {
				input: { name: largeName, email: "large@example.com" },
			})
			.assert();
		expect(r.success).toBe(true);
		expect(r.data.name).toBe(largeName);
	});

	it("should handle special characters in user name", async () => {
		const specialName = "John @#$%^&*() Doe";
		const r = await client
			.post("/api/v1/users", {
				input: { name: specialName, email: "special@example.com" },
			})
			.assert();
		expect(r.success).toBe(true);
		expect(r.data.name).toBe(specialName);
	});

	it("should return correct content type", async () => {
		const r = await client.get("/api/v1/users", {}).assert();
		expect(r.success).toBe(true);
		expect(r.response.headers.get("content-type")).toContain(
			"application/json",
		);
	});

	it("should handle multiple updates to the same user", async () => {
		const createResp = await client
			.post("/api/v1/users", {
				input: { name: "Multi Update", email: "multi@example.com" },
			})
			.assert();
		const userId = createResp.data.id;

		for (let i = 0; i < 5; i++) {
			const r = await client
				.put("/api/v1/users/:id", {
					params: { id: userId.toString() },
					input: { name: `Multi Update ${i}` },
				})
				.assert();
			expect(r.success).toBe(true);
			expect(r.data.name).toBe(`Multi Update ${i}`);
		}

		const finalGet = await client
			.get("/api/v1/users/:id", { params: { id: userId.toString() } })
			.assert();
		expect(finalGet.data.name).toBe("Multi Update 4");
	});
});
