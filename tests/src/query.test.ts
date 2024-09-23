import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import bunicornClient from "@bunicorn/client";
import type { Server } from "bun";
import { type AppType, app } from "./server/query.server.ts";

let server: Server;
beforeAll(async () => {
	server = app.serve({ port: 8102 });
});

afterAll(() => {
	server.stop(true);
});

describe("query parameter tests", () => {
	const client = bunicornClient<AppType>({
		serverPath: "http://localhost:8102",
	});

	// Tests without Zod
	it("should get a single query parameter", async () => {
		const r = await client
			.get("/api/v1/single-param", { query: { key: "value" } })
			.assert();
		expect(r.success).toBe(true);
		expect(r.data).toEqual({ key: "value" });
	});

	it("should get multiple query parameters", async () => {
		const r = await client
			.get("/api/v1/multiple-params", { query: { x: "1", y: "2" } })
			.assert();
		expect(r.success).toBe(true);
		expect(r.data).toEqual({ x: "1", y: "2" });
	});

	it("should handle array query parameters", async () => {
		const r = await client
			.get("/api/v1/array-param", {
				query: { values: ["a", "b", "c"].toString() },
			})
			.assert();
		expect(r.success).toBe(true);
		expect(r.data).toEqual({ values: ["a", "b", "c"] });
	});

	it("should handle boolean query parameters", async () => {
		const r = await client
			.get("/api/v1/boolean-param", { query: { flag: "true" } })
			.assert();
		expect(r.success).toBe(true);
		expect(r.data).toEqual({ flag: true });
	});

	it("should use default value for missing query parameter", async () => {
		const r = await client.get("/api/v1/default-param", {}).assert();
		expect(r.success).toBe(true);
		expect(r.data).toEqual({ value: "default" });
	});

	// Tests with Zod
	it("should validate string query parameter with Zod", async () => {
		const r = await client
			.get("/api/v1/zod-string", { query: { x: "test" } })
			.assert();
		expect(r.success).toBe(true);
		expect(r.data).toEqual({ x: "test" });
	});

	it("should coerce and validate number query parameter with Zod", async () => {
		const r = await client
			.get("/api/v1/zod-number", { query: { num: "42" } })
			.assert();
		expect(r.success).toBe(true);
		expect(r.data).toEqual({ num: 42 });
	});

	it("should handle optional query parameter with Zod", async () => {
		const r1 = await client
			.get("/api/v1/zod-optional", { query: { opt: "present" } })
			.assert();
		expect(r1.success).toBe(true);
		expect(r1.data).toEqual({ opt: "present" });

		const r2 = await client.get("/api/v1/zod-optional", {}).assert();
		expect(r2.success).toBe(true);
		expect(r2.data).toEqual({ opt: undefined });
	});

	it("should validate array query parameter with Zod", async () => {
		const r = await client
			.get("/api/v1/zod-array", {
				query: { items: ["x", "y", "z"].toString() },
			})
			.assert();
		expect(r.success).toBe(true);
		expect(r.data).toEqual({ items: ["x", "y", "z"] });
	});

	it("should validate enum query parameter with Zod", async () => {
		const r = await client
			.get("/api/v1/zod-enum", { query: { color: "red" } })
			.assert();
		expect(r.success).toBe(true);
		expect(r.data).toEqual({ color: "red" });
	});

	// Additional tests for error cases
	it("should return an error for invalid number with Zod", async () => {
		const r = await client.get("/api/v1/zod-number", {
			query: { num: "not-a-number" },
		});
		expect(r.success).toBe(false);
		if (!r.success) {
			expect(r.error.message).toContain("Validation Error");
		}
	});

	it("should return an error for invalid enum value with Zod", async () => {
		const r = await client.get("/api/v1/zod-enum", {
			query: { color: "yellow" },
		});
		expect(r.success).toBe(false);
		if (!r.success) {
			expect(r.error.message).toContain("Validation Error");
		}
	});
});
