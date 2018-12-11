/**
 * To clarify (to avoid bitwise operation) use string
 *
 * (1, 2, 4) -> 0001
 * (10, 2, 4) -> 1010
 * (257,16,4) -> 0101
 */
export function numberToStringWithRadixAndPadding(
  num: number | string,
  radix: number = 2,
  digit: number = 0
): string {
  return Number(num).toString(radix).padStart(digit, '0');
}

/**
 * Calculate padding bytes
 *
 * (2, 4) -> 2
 * (4, 4) -> 0
 * (7, 4) -> 3
 * (15, 4) -> 1
 */
export function calcPaddingByte(curByte: number, boundaryByte: number): number {
  const missingBoundaryByte = curByte % boundaryByte;
  const paddingByte = missingBoundaryByte === 0 ? 0 : boundaryByte - missingBoundaryByte;
  return paddingByte;
}
