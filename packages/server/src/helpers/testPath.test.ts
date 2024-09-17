import { describe, expect, it } from "bun:test";
import type { __BuiltRoute } from "../router/types.ts";
import { __testPath } from "./testPath.ts";

describe("__testPath", () => {
	// For shorter type names
	type Route = __BuiltRoute;

	it("should return matched groups when regexp matches the target", () => {
		const route: Partial<Route> = {
			regexp: /\/user\/(\d+)/,
			path: "/user/:id",
		};
		const target = "/user/123";
		const result = __testPath(route as Route, target);
		expect(result).toEqual(["123"]);
	});

	it("should return false when regexp does not match the target", () => {
		const route: Partial<Route> = {
			regexp: /\/user\/(\d+)/,
			path: "/user/:id",
		};
		const target = "/product/123";
		const result = __testPath(route as Route, target);
		expect(result).toBe(false);
	});

	it("should return true when path matches the target and no regexp is provided", () => {
		const route: Partial<Route> = {
			regexp: undefined,
			path: "/home",
		};
		const target = "/home";
		const result = __testPath(route as Route, target);
		expect(result).toBe(true);
	});

	it("should return false when path does not match the target and no regexp is provided", () => {
		const route: Partial<Route> = {
			regexp: undefined,
			path: "/home",
		};
		const target = "/about";
		const result = __testPath(route as Route, target);
		expect(result).toBe(false);
	});
});
