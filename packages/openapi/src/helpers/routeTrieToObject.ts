import type { BaseMethod } from "@bunicorn/server";
import type { Route } from "@bunicorn/server/internal";

export function routeTrieToObject(
	routeMatcher: any,
	method: BaseMethod = "ALL",
) {
	const routes: Route[] = [];
	const trie = routeMatcher.tries[method];

	function traverse(node: any, path: string | string[]) {
		if (node.route) {
			const fullPath = `/${[...routeMatcher.basePathSegments, ...path].join("/")}`;
			node.route.path = fullPath;
			routes.push(node.route);
		}

		// Traverse static children
		for (const [segment, child] of Object.entries(node.children)) {
			traverse(child, [...path, segment]);
		}

		// Traverse dynamic child
		if (node.dynamicChild) {
			traverse(node.dynamicChild, [...path, `:${node.dynamicChild.paramName}`]);
		}

		// Traverse wildcard child
		if (node.wildcardChild) {
			traverse(node.wildcardChild, [...path, "*"]);
		}
	}

	traverse(trie, []);
	return routes;
}
