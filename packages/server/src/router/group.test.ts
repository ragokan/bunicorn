import { describe, expect, it } from "bun:test";
import { RouteBuilder } from "./builder.ts";
import { groupRoutes } from "./group.ts";
import type { Route } from "./route.ts";

describe("groupRoutes", () => {
	const routeBuilder = new RouteBuilder();
	it("merges base path with route paths", () => {
		const basePath = "/api";
		const routes: Route<any, any, any, any>[] = [
			routeBuilder.get("/users", () => {}),
			routeBuilder.get("/posts", () => {}),
		];

		const result = groupRoutes(basePath, routes);

		expect(result[0]!.path).toEqual("/api/users");
		expect(result[1]!.path).toEqual("/api/posts");
	});

	it("handles root base path correctly", () => {
		const basePath = "/";
		const routes: Route<any, any, any, any>[] = [
			routeBuilder.get("/users", () => {}),
			routeBuilder.get("/posts", () => {}),
		];

		const result = groupRoutes(basePath, routes);

		expect(result[0]!.path).toEqual("/users");
		expect(result[1]!.path).toEqual("/posts");
	});

	it("adds meta properties to routes", () => {
		const basePath = "/api";
		const routes: Route<any, any, any, any>[] = [
			routeBuilder.meta({ auth: true }).get("/users", () => {}),
			routeBuilder.meta({ auth: false }).get("/posts", () => {}),
		];

		const result = groupRoutes(basePath, routes, { description: "test" });

		expect(result[0]!.meta).toEqual({ auth: true, description: "test" });
		expect(result[1]!.meta).toEqual({ auth: false, description: "test" });
	});

	it("handles routes without meta properties", () => {
		const basePath = "/api";
		const routes: Route<any, any, any, any>[] = [
			routeBuilder.get("/users", () => {}),
			routeBuilder.get("/posts", () => {}),
		];
		const metaProps = { version: 1 };

		const result = groupRoutes(basePath, routes, metaProps);

		expect(result[0]!.meta).toEqual({ version: 1 });
		expect(result[1]!.meta).toEqual({ version: 1 });
	});
});
