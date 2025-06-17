export function capitalizeWords(input) {
  return input
    .split(',')
    .map(
      word =>
        word.trim().charAt(0).toUpperCase() +
        word.trim().slice(1).toLowerCase(),
    )
    .join(',');
}
