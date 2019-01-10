export function isStunMessage($buffer: Buffer): boolean {
  // the first 2bit must be 0 in first 1byte
  const first8bit = numberToBinaryStringArray($buffer[0], 8);
  if (first8bit[0] === '0' && first8bit[1] === '0') {
    return true;
  }
  return false;
}

/**
 * The toString for bit operation
 *
 * (1, 4) -> [0, 0, 0, 1]
 * (10, 4) -> [1, 0, 1, 0]
 * (257, 8) -> [1, 0, 0, 0, 0, 0, 0, 1]
 */
export function numberToBinaryStringArray(
  num: number,
  digit: number = 0,
): string[] {
  const binStr = num.toString(2).padStart(digit, '0');
  return binStr.split('');
}

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
 * Thus STUN message type becomes 16bit,
 * and finally it is returned as number.
 *
 * BINDING_REQUEST: 0x0001 = 1
 * BINDING_INDICATION: 0x0011 = 17
 * BINDING_RESPONSE_SUCCESS: 0x0101 = 257
 * BINDING_RESPONSE_ERROR: 0x0111 = 273
 */
export function methodAndClassToMessageType([method, klass]: [
  number,
  number
]): number {
  const [
    m11,
    m10,
    m9,
    m8,
    m7,
    m6,
    m5,
    m4,
    m3,
    m2,
    m1,
    m0,
  ] = numberToBinaryStringArray(method, 12);
  const [c1, c0] = numberToBinaryStringArray(klass, 2);

  // 16bit string
  const binStr = [
    '0',
    '0',
    m11,
    m10,
    m9,
    m8,
    m7,
    c1,
    m6,
    m5,
    m4,
    c0,
    m3,
    m2,
    m1,
    m0,
  ].join('');

  return parseInt(binStr, 2);
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

export function writeAttrBuffer(type: number, $value: Buffer): Buffer {
  // 2byte(16bit) for type
  const $type = Buffer.alloc(2);
  $type.writeUInt16BE(type, 0);

  // 2byte(16bit) for length
  const $length = Buffer.alloc(2);
  $length.writeUInt16BE($value.length, 0);

  const paddingByte = calcPaddingByte($value.length, 4);
  const $padding = Buffer.alloc(paddingByte);

  return Buffer.concat([$type, $length, $value, $padding]);
}
