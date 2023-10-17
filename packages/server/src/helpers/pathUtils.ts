import { type BasePath, type __ExtractParams } from "../router/types.ts";

export function __getParams<TPath extends BasePath = BasePath>(
  path: TPath,
  match: string[] | boolean
) {
  if (typeof match == "boolean" || match.length == 0) {
    return {} as __ExtractParams<TPath>;
  }

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

  return params as __ExtractParams<TPath>;
}

export function __withoutTrailingSlash(path: string) {
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

export function __mergePaths<TPath1 extends BasePath, TPath2 extends BasePath>(
  path1: TPath1,
  path2: TPath2
) {
  return (__withoutTrailingSlash(path1) +
    __withoutTrailingSlash(path2)) as BasePath;
}
