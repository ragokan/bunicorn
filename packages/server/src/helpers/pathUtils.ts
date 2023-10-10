import { type BasePath, type ExtractParams } from "../router/types.js";

export function getParams<TPath extends BasePath = BasePath>(
  path: TPath,
  match: string[]
) {
  const paramNames = path
    .split("/")
    .filter(x => x.startsWith("...") || x.startsWith(":"))
    .map(x => x.replace(/[:.]+/, ""));
  const params: Record<string, string | string[]> = {};

  for (let i = 0; i < match.length; i++) {
    const key = paramNames[i];
    if (key) {
      if (path.includes(`...${key}`)) {
        params[key] = match[i] ? match[i]!.split("/") : [];
      } else {
        params[key] = match[i]!;
      }
    }
  }

  return params as ExtractParams<TPath>;
}

export function withoutTrailingSlash(path: string) {
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

export function mergePaths<TPath1 extends BasePath, TPath2 extends BasePath>(
  path1: TPath1,
  path2: TPath2
) {
  return (withoutTrailingSlash(path1) +
    withoutTrailingSlash(path2)) as BasePath;
}
