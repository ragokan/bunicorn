import type { __BuiltRoute } from "../router/types.ts";

export function __testPath(route: __BuiltRoute, target: string) {
	if (route.regexp) {
		const matchResult = route.regexp.exec(target);
		return matchResult ? matchResult.slice(1) : false;
	}
	return route.path === target;
}
