export function sleep(duration = 1000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, duration));
}
