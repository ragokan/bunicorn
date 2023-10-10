const isBunicornRegex = [
  ":",
  "\\.\\.\\.",
  "\\.\\*",
  "\\?",
  "\\+",
  "\\$",
  "\\^",
  "\\[",
  "\\]",
  "\\(",
  "\\)",
  "\\{",
  "\\}",
  "\\|"
].map(pattern => new RegExp(pattern));

export function __checkPathIsRegex(path: string) {
  for (const regex of isBunicornRegex) {
    if (regex.test(path)) {
      return true;
    }
  }
  return false;
}
