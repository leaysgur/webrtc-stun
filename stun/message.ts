import { createHeader } from './header';
import { createSoftware } from './attribute';
import { numberToStringWithRadixAndPadding, calcPaddingByte } from './utils';

export function createBindingRequest(): Buffer {
  const body = Buffer.concat([
    // SHOULD
    createSoftware('webrtc-stack-study'),
  ]);

  // body size is needed for message length
  const header = createHeader(body.length);

  return Buffer.concat([header, body]);
}

export function isStunMessage(msg: Buffer): boolean {
  // 8bit is enough to know first 0, 1bit
  const first1byte = msg.readUInt8(0);
  const first8bit = numberToStringWithRadixAndPadding(first1byte, 2, 8);

  return first8bit.charAt(0) === '0' && first8bit.charAt(1) === '0';
}

interface Attribute {
  type: number;
  length: number;
  value: Buffer;
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
