import { createHeader } from './header';
import { createSoftware } from './attribute';
import { numberToStringWithRadixAndPadding, calcPaddingByte } from './utils';

const MESSAGE_CLASS = {
  REQUEST: 0b00,
  // INDICATION: 0b01,
  // RESPONSE_SUCCESS: 0b10,
  // RESPONSE_ERROR: 0b11,
};

const MESSAGE_METHOD = {
  BINDING: 0b000000000001,
};

const MESSAGE_TYPE = {
  BINDING_REQUEST: calcMessageType(MESSAGE_METHOD.BINDING, MESSAGE_CLASS.REQUEST),
  // BINDING_INDICATION: calcMessageType(MESSAGE_METHOD.BINDING, MESSAGE_CLASS.INDICATION),
  // BINDING_RESPONSE_SUCCESS: calcMessageType(MESSAGE_METHOD.BINDING, MESSAGE_CLASS.RESPONSE_SUCCESS),
  // BINDING_RESPONSE_ERROR: calcMessageType(MESSAGE_METHOD.BINDING, MESSAGE_CLASS.RESPONSE_ERROR),
};

interface Attribute {
  type: number;
  length: number;
  value: Buffer;
}

export function createBindingRequest(): Buffer {
  const body = Buffer.concat([
    // SHOULD
    createSoftware('webrtc-stack-study'),
  ]);

  // body size is needed for message length
  const header = createHeader(
    MESSAGE_TYPE.BINDING_REQUEST,
    body.length
  );

  return Buffer.concat([header, body]);
}

export function isStunMessage(msg: Buffer): boolean {
  // 8bit is enough to know first 0, 1bit
  const first1byte = msg.readUInt8(0);
  const first8bit = numberToStringWithRadixAndPadding(first1byte, 2, 8);

  return first8bit.charAt(0) === '0' && first8bit.charAt(1) === '0';
}

export function parseAttributes(msg: Buffer): Attribute[] {
  // STUN Message Header is 20byte = 160bit
  // const header = msg.slice(0, 20);
  const body = msg.slice(20, msg.length);

  const attrs: Map<number, Attribute> = new Map();
  let offset = 0;
  while (offset < body.length) {
    const type = body.readUInt16BE(offset);
    offset += 2; // 16bit = 2byte

    const length = body.readUInt16BE(offset);
    offset += 2; // 16bit = 2byte

    const value = body.slice(offset, offset + length);
    offset += length;

    // STUN Attribute must be in 32bit(= 4byte) boundary
    const paddingByte = calcPaddingByte(length, 4);
    offset += paddingByte;

    // skip duplicates
    if (attrs.has(type)) {
      continue;
    }
    attrs.set(type, { type, length, value });
  }

  return [...attrs.values()];
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
 * Then STUN Message Type is 16bit binary string.
 * Finally we return it as hex number.
 *
 * BINDING_REQUEST: 0x0001
 * BINDING_INDICATION: 0x0011
 * BINDING_RESPONSE_SUCCESS: 0x0101
 * BINDING_RESPONSE_ERROR: 0x0111
 */
function calcMessageType(method: number, klass: number): number {
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
