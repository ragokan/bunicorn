type ArgsType<T> = T extends (...args: infer U) => unknown ? U : never;
interface Options {
  callAtEnd?: boolean;
}

export function throttle<T extends Function>(
  fn: T,
  delay = 300,
  { callAtEnd = false }: Options = {}
) {
  let _timer: ReturnType<typeof setTimeout> | undefined;
  let _latestArgs: ArgsType<T> | undefined;

  return (...args: ArgsType<T>): void => {
    if (_timer) {
      _latestArgs = args;
      return;
    }
    fn(...args);
    _timer = setTimeout(() => {
      if (callAtEnd && _latestArgs) {
        fn(..._latestArgs);
        _latestArgs = undefined;
      }
      _timer = undefined;
    }, delay);
  };
}
