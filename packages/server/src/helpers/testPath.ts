export function __testPath(regexp: RegExp, target: string) {
  const matchResult = regexp.exec(target);

  if (matchResult) {
    const [, ...capturedGroups] = matchResult;
    return capturedGroups;
  }
  return null;
}
