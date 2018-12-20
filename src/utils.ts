/**
 * The toString for bit operation
 *
 * (1, 2, 4) -> 0001
 * (10, 2, 4) -> 1010
 * (257, 16, 8) -> 00000101
 */
export function numberToStringWithRadixAndPadding(
  num: number,
  radix: number = 2,
  digit: number = 0,
): string {
  return num.toString(radix).padStart(digit, '0');
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
  const paddingByte =
    missingBoundaryByte === 0 ? 0 : boundaryByte - missingBoundaryByte;
  return paddingByte;
}

/**
 * Calculate XOR with Buffer
 */
export function bufferXor(a: Buffer, b: Buffer): Buffer {
  const length = Math.max(a.length, b.length);
  const buffer = Buffer.allocUnsafe(length);

  for (let i = 0; i < length; i++) {
    buffer[i] = a[i] ^ b[i];
  }

  return buffer;
}
