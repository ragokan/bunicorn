import type { __BuiltRoute } from "../router/types.ts";

export function __testPath(route: __BuiltRoute, target: string) {
	if (route.regexp) {
		const matchResult = route.regexp.exec(target);

		if (matchResult) {
			const [, ...capturedGroups] = matchResult;
			return capturedGroups;
		}
		return false;
	}
	return route.path == target;
}
