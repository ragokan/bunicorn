export function createArray<T = number>(
	length: number,
	generator: (index: number) => T = (i) => i as T,
) {
	return Array.from({ length }, (_, i) => generator(i));
}
