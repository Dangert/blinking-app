function format(value, scale, modulo, padding) {
  value = Math.floor(value / scale) % modulo;
  return value.toString().padStart(padding, 0);
}

export const formatTime = (timer) => {
  const centiseconds = format(timer, 1, 1000, 3);
  const seconds = format(timer, 1000, 60, 2);
  const minutes = format(timer, 60000, 60, 2);

  return `${minutes}:${seconds}:${centiseconds}`
}
