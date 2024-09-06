export function insert<T>(array: T[], index: number, ...items: T[]) {
	return array.splice(index, 0, ...items);
}

export function getRandomElement<T>(arr: Array<T>): T | undefined {
	return arr[Math.floor(Math.random() * arr.length)];
}
