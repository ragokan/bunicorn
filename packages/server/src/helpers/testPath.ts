import { type BuiltRoute } from "src/router/types.ts";

export function __testPath(route: BuiltRoute, target: string) {
  if (route.regexp) {
    const matchResult = route.regexp.exec(target);

    if (matchResult) {
      const [, ...capturedGroups] = matchResult;
      return capturedGroups;
    }
    return false;
  } else {
    return route.path === target;
  }
}
