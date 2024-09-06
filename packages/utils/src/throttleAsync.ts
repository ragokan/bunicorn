type AsyncArgsType<T> = T extends (...args: infer U) => unknown
	? U extends Promise<infer Y>
		? Y
		: U
	: never;
interface Options<R> {
	callAtEnd?: boolean;
	onResolve?: (result: Awaited<R>) => void;
}
export function throttleAsync<
	T extends (...args: AsyncArgsType<T>) => Promise<any>,
	R = ReturnType<Awaited<T>>,
>(fn: T, { callAtEnd = false, onResolve }: Options<R> = {}) {
	let _latestArgs: AsyncArgsType<T> | undefined;
	let _promise: Promise<R> | undefined;

	return (...args: AsyncArgsType<T>): void => {
		_latestArgs = args;
		if (_promise) {
			return;
		}
		function executeFunction() {
			(_promise = fn(...(_latestArgs as AsyncArgsType<T>))).then((r) => {
				onResolve?.(r);
				_promise = undefined;
				if (callAtEnd && _latestArgs) {
					executeFunction();
					_latestArgs = undefined;
				}
			});
		}
		executeFunction();
	};
}
