const MESSAGE_CLASS = {
  REQUEST: 0b00,
  INDICATION: 0b01,
  RESPONSE_SUCCESS: 0b10,
  RESPONSE_ERROR: 0b11,
};

const MESSAGE_METHOD = {
  BINDING: 0b000000000001,
};

export const MESSAGE_TYPE = {
  BINDING_REQUEST: getMessageType(MESSAGE_METHOD.BINDING, MESSAGE_CLASS.REQUEST),
  // BINDING_INDICATION: getMessageType(MESSAGE_METHOD.BINDING, MESSAGE_CLASS.INDICATION),
  // BINDING_RESPONSE_SUCCESS: getMessageType(MESSAGE_METHOD.BINDING, MESSAGE_CLASS.RESPONSE_SUCCESS),
  // BINDING_RESPONSE_ERROR: getMessageType(MESSAGE_METHOD.BINDING, MESSAGE_CLASS.RESPONSE_ERROR),
};

export const MAGIC_COOKIE = 0x2112a442;

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
 * Then STUN Message Type is 16bit binary string.
 * Finally we return it as hex number.
 *
 * BINDING_REQUEST: 0x0001
 * BINDING_INDICATION: 0x0011
 * BINDING_RESPONSE_SUCCESS: 0x0101
 * BINDING_RESPONSE_ERROR: 0x0111
 */
function getMessageType(method: number, klass: number): number {
  const methodStr = numberToStringWithRadixAndPadding(method, 2, 12);
  const classStr = numberToStringWithRadixAndPadding(klass, 2, 2);

  const m1 = methodStr.slice(0, 5);
  const m2 = methodStr.slice(5, 8);
  const m3 = methodStr.slice(8, 12)
  const c1 = classStr.slice(0, 1);
  const c2 = classStr.slice(1, 2);

  const binStr = `00${m1}${c1}${m2}${c2}${m3}`;
  const hexStr = numberToStringWithRadixAndPadding(binStr, 16, 4);
  return parseInt(hexStr, 16);
}

/**
 *
 * (1, 2, 4) -> 0001
 * (10, 2, 4) -> 1010
 * (257,16,4) -> 0101
 *
 */
function numberToStringWithRadixAndPadding(
  num: number | string,
  radix: number = 2,
  digit: number = 0
): string {
  return Number(num).toString(radix).padStart(digit, '0');
}
