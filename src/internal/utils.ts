import { randomBytes, createHmac } from 'crypto';

export function generateTransactionId(): string {
  return randomBytes(12).toString('hex');
}

export function generateHmacSha1Digest(key: string, $buf: Buffer): Buffer {
  return createHmac('sha1', key)
    .update($buf)
    .digest();
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
 * The toString for bit operation
 *
 * (1, 4) -> [0, 0, 0, 1]
 * (10, 4) -> [1, 0, 1, 0]
 * (257, 8) -> [0, 0, 0, 0, 0, 1, 0, 1]
 */
export function numberToBinaryStringArray(
  num: number,
  digit: number = 0,
): string[] {
  const binStr = num.toString(2).padStart(digit, '0');
  return binStr.split('');
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

export function bufferXor(a: Buffer, b: Buffer): Buffer {
  // a and b should have same length
  const length = a.length;
  const buffer = Buffer.allocUnsafe(length);

  for (let i = 0; i < length; i++) {
    buffer[i] = a[i] ^ b[i];
  }

  return buffer;
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

export function ipV4BufferToString($ip: Buffer): string {
  const res = [];
  for (const digit of $ip) {
    res.push(digit.toString());
  }
  return res.join('.');
}
export function ipV4StringToBuffer(ip: string): Buffer {
  const res = Buffer.alloc(4);
  let idx = 0;
  for (const digit of ip.split('.')) {
    res[idx] = parseInt(digit, 10);
    idx++;
  }
  return res;
}

export function ipV6BufferToString($ip: Buffer): string {
  const res = [];
  for (let i = 0; i < $ip.length; i += 2) {
    res.push($ip.readUInt16BE(i).toString(16));
  }
  return res
    .join(':')
    .replace(/(^|:)0(:0)*:0(:|$)/, '$1::$3')
    .replace(/:{3,4}/, '::');
}
export function ipV6StringToBuffer(ip: string): Buffer {
  // TODO: impl
  return Buffer.from(ip);
}
