import type { Route } from "../router/route.ts";
import type { BaseMethod, __BuiltRoute } from "../router/types.ts";
import { restPath } from "./constants.ts";
import type { TrieNode } from "./types.ts";

export class RouteTrieMatcher {
	private tries: Record<BaseMethod, TrieNode>;
	private basePathSegments: string[];

	constructor(basePath = "") {
		this.basePathSegments = basePath.split("/").filter(Boolean);
		this.tries = {
			GET: this.createNode(),
			POST: this.createNode(),
			PUT: this.createNode(),
			DELETE: this.createNode(),
			PATCH: this.createNode(),
			OPTIONS: this.createNode(),
			HEAD: this.createNode(),
			ALL: this.createNode(),
		};
	}

	addRoute(route: Route): void {
		const { path, method } = route;
		const segments = path.split("/").filter(Boolean);
		let node = this.tries[method];

		for (let i = 0; i < segments.length; i++) {
			const segment = segments[i]!;
			if (segment === restPath) {
				node = node.wildcardChild ??= this.createNode(true);
				break;
			}

			if (segment.startsWith(":")) {
				node = node.dynamicChild ??= this.createNode(false, segment.slice(1));
			} else {
				node = node.children[segment] ??= this.createNode();
			}
		}

		const buildRoute = route as __BuiltRoute;
		buildRoute.isWildcard = segments.includes(restPath);
		node.route = buildRoute;
	}

	matchRoute(method: BaseMethod, path: string): __BuiltRoute | null {
		const segments = path.split("/").filter(Boolean);
		if (segments.length < this.basePathSegments.length) {
			return null;
		}

		for (let i = 0; i < this.basePathSegments.length; i++) {
			if (segments[i] !== this.basePathSegments[i]) {
				return null;
			}
		}

		const matchForMethod = this.matchRouteForMethod(method, segments);
		if (matchForMethod) {
			return matchForMethod;
		}

		// If no match found for the specific method, try matching with ALL
		return this.matchRouteForMethod("ALL", segments);
	}

	private matchRouteForMethod(
		method: BaseMethod,
		segments: string[],
	): __BuiltRoute | null {
		let node: TrieNode | null = this.tries[method];
		const params: Record<string, string> = {};
		let wildcardMatch: __BuiltRoute | null = null;

		for (
			let i = this.basePathSegments.length;
			i < segments.length && node;
			i++
		) {
			const segment = segments[i]!;

			if (node.wildcardChild) {
				wildcardMatch = this.createResultRoute(node.wildcardChild, {
					...params,
					restPath: segments.slice(i).join("/"),
				});
				if (wildcardMatch) {
					return wildcardMatch;
				}
			}

			node = node.children[segment] ?? node.dynamicChild;
			if (node?.paramName) {
				params[node.paramName] = segment;
			}
		}

		return node ? this.createResultRoute(node, params) : wildcardMatch;
	}

	private createNode(
		isWildcard = false,
		paramName: string | null = null,
	): TrieNode {
		return {
			children: Object.create(null),
			dynamicChild: null,
			wildcardChild: null,
			route: null,
			paramName,
			isWildcard,
		};
	}

	private createResultRoute(
		node: TrieNode,
		params: Record<string, string>,
	): __BuiltRoute | null {
		if (node.route) {
			node.route.params = params;
			return node.route;
		}
		return null;
	}
}
