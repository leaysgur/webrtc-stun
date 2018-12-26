/**
 *  0                 1
 *  2  3  4 5 6 7 8 9 0 1 2 3 4 5
 * +--+--+-+-+-+-+-+-+-+-+-+-+-+-+
 * |M |M |M|M|M|C|M|M|M|C|M|M|M|M|
 * |11|10|9|8|7|1|6|5|4|0|3|2|1|0|
 * +--+--+-+-+-+-+-+-+-+-+-+-+-+-+
 *
 * M = Method / C = Class
 *   12bit Method is split into 5, 3, 4bit
 *   2bit Class is split into 1, 1bit
 * and combined together as 14bit string,
 * and append first 2bit as `00`.
 *
 * Thus STUN Message Type becomes 16bit,
 * and finally it is returned as number.
 *
 * BINDING_REQUEST: 0x0001 = 1
 * BINDING_INDICATION: 0x0011 = 17
 * BINDING_RESPONSE_SUCCESS: 0x0101 = 257
 * BINDING_RESPONSE_ERROR: 0x0111 = 273
 */
export function calcMessageType(method: number, klass: number): number {
  const methodStr = numberToStringWithRadixAndPadding(method, 2, 12);
  const classStr = numberToStringWithRadixAndPadding(klass, 2, 2);

  const m1 = methodStr.slice(0, 5);
  const m2 = methodStr.slice(5, 8);
  const m3 = methodStr.slice(8, 12);
  const c1 = classStr.slice(0, 1);
  const c2 = classStr.slice(1, 2);

  // 16bit string
  const binStr = `00${m1}${c1}${m2}${c2}${m3}`;
  return parseInt(binStr, 2);
}

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
