import { type BuiltRoute } from "src/router/types.js";

export function __testPath(route: BuiltRoute, target: string) {
  const matchResult = route.regexp.exec(target);

  if (matchResult) {
    const [, ...capturedGroups] = matchResult;
    return capturedGroups;
  }
  return null;
}
