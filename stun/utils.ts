/**
 *
 * (1, 2, 4) -> 0001
 * (10, 2, 4) -> 1010
 * (257,16,4) -> 0101
 *
 */
export function numberToStringWithRadixAndPadding(
  num: number | string,
  radix: number = 2,
  digit: number = 0
): string {
  return Number(num).toString(radix).padStart(digit, '0');
}
