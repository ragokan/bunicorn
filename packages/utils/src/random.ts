export function randomNumber(max: number = 100, min: number = 0) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function randomString(length = 7) {
  return Math.random().toString(36).substring(length);
}
