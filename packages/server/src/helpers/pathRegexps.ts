const getPathRegex = /^(https?:\/\/)?[^/]+(\/[^?#]*)/;
const getSearchParamsRegexp = /[?&]([^=#]+)=([^&#]*)/g;

export function __getSearchParams(
  url: string
): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {};
  let match: RegExpExecArray | null;

  try {
    while ((match = getSearchParamsRegexp.exec(url))) {
      if (match[1] && match[2]) {
        if (Object.prototype.hasOwnProperty.call(params, match[1])) {
          if (Array.isArray(params[match[1]])) {
            (params[match[1]] as string[]).push(match[2]);
          } else {
            params[match[1]] = [params[match[1]] as string, match[2]];
          }
        } else {
          params[match[1]] = match[2];
        }
      }
    }
  } catch (_) {
    // Do nothing!
  } finally {
    getSearchParamsRegexp.lastIndex = 0;
  }

  return params;
}

export function __getPath(url: string) {
  return getPathRegex.exec(url)?.[2] ?? "";
}
