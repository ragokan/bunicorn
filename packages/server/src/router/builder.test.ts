import { describe, expect, it } from "bun:test";
import { createMiddleware } from "src/middleware.ts";
import * as v from "valibot";
import type { BunicornContext } from "../context/base.ts";
import type { BunicornSchema } from "../validation/types.ts";
import { RouteBuilder } from "./builder.ts";

describe("RouteBuilder", () => {
	it("should add middleware using use()", () => {
		const builder = new RouteBuilder();
		const middleware = createMiddleware(() => {});
		const newBuilder = builder.use(middleware);
		expect(newBuilder).not.toBe(builder);
		// @ts-expect-error Route is private
		expect(newBuilder.route.middlewares).toContain(middleware);
	});

	it("should set input schema using input()", () => {
		const builder = new RouteBuilder();
		const schema: BunicornSchema = v.object({ message: v.string() });
		const newBuilder = builder.input(schema);
		expect(newBuilder).not.toBe(builder);
		// @ts-expect-error Route is private
		expect(newBuilder.route.input).toBe(schema);
	});

	it("should set output schema using output()", () => {
		const builder = new RouteBuilder();
		const schema: BunicornSchema = v.object({ message: v.string() });
		const newBuilder = builder.output(schema);
		expect(newBuilder).not.toBe(builder);
		// @ts-expect-error Route is private
		expect(newBuilder.route.output).toBe(schema);
	});

	it("should set meta properties using meta()", () => {
		const builder = new RouteBuilder();
		const meta = { description: "Test route" };
		const newBuilder = builder.meta(meta);
		expect(newBuilder).not.toBe(builder);
		// @ts-expect-error Route is private
		expect(newBuilder.route.meta).toEqual(meta);
	});

	it("should create a GET route using get()", () => {
		const builder = new RouteBuilder();
		const handler = (ctx: BunicornContext) => ctx.json({});
		const route = builder.get("/test", handler);
		expect(route.method).toBe("GET");
		expect(route.path).toBe("/test");
		expect(route.handler).toBe(handler);
	});

	it("should create a POST route using post()", () => {
		const builder = new RouteBuilder();
		const handler = (ctx: BunicornContext) => ctx.json({});
		const route = builder.post("/test", handler);
		expect(route.method).toBe("POST");
		expect(route.path).toBe("/test");
		expect(route.handler).toBe(handler);
	});

	it("should create a PUT route using put()", () => {
		const builder = new RouteBuilder();
		const handler = (ctx: BunicornContext) => ctx.json({});
		const route = builder.put("/test", handler);
		expect(route.method).toBe("PUT");
		expect(route.path).toBe("/test");
		expect(route.handler).toBe(handler);
	});

	it("should create a PATCH route using patch()", () => {
		const builder = new RouteBuilder();
		const handler = (ctx: BunicornContext) => ctx.json({});
		const route = builder.patch("/test", handler);
		expect(route.method).toBe("PATCH");
		expect(route.path).toBe("/test");
		expect(route.handler).toBe(handler);
	});

	it("should create a DELETE route using delete()", () => {
		const builder = new RouteBuilder();
		const handler = (ctx: BunicornContext) => ctx.json({});
		const route = builder.delete("/test", handler);
		expect(route.method).toBe("DELETE");
		expect(route.path).toBe("/test");
		expect(route.handler).toBe(handler);
	});

	it("should create a HEAD route using head()", () => {
		const builder = new RouteBuilder();
		const handler = (ctx: BunicornContext) => ctx.json({});
		const route = builder.head("/test", handler);
		expect(route.method).toBe("HEAD");
		expect(route.path).toBe("/test");
		expect(route.handler).toBe(handler);
	});

	it("should create an OPTIONS route using options()", () => {
		const builder = new RouteBuilder();
		const handler = (ctx: BunicornContext) => ctx.json({});
		const route = builder.options("/test", handler);
		expect(route.method).toBe("OPTIONS");
		expect(route.path).toBe("/test");
		expect(route.handler).toBe(handler);
	});

	it("should create an ALL route using all()", () => {
		const builder = new RouteBuilder();
		const handler = (ctx: BunicornContext) => ctx.json({});
		const route = builder.all("/test", handler);
		expect(route.method).toBe("ALL");
		expect(route.path).toBe("/test");
		expect(route.handler).toBe(handler);
	});
});
