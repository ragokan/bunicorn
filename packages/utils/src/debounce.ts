type ArgsType<T> = T extends (...args: infer U) => unknown ? U : never;

export function debounce<T extends Function>(func: T, ms = 300) {
  let timeout: Timer;

  return (...args: ArgsType<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), ms);
  };
}
