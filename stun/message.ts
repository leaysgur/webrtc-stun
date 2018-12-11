import { createHeader } from './header';
import { createSoftware } from './attribute';
import { BINDING_REQUEST } from './message-type';
import { numberToStringWithRadixAndPadding, calcPaddingByte } from './utils';

interface Header {
  type: number;
}
interface Attribute {
  type: number;
  length: number;
  value: Buffer;
}

export function createBindingRequest(): Buffer {
  const attrs = Buffer.concat([
    // SHOULD
    createSoftware('webrtc-stack-study'),
  ]);

  // attrs size is needed for message length
  const header = createHeader(
    BINDING_REQUEST,
    attrs.length
  );

  return Buffer.concat([header, attrs]);
}

export function isStunMessage(msg: Buffer): boolean {
  // 8bit is enough to know first 0, 1bit
  const first1byte = msg.readUInt8(0);
  const first8bit = numberToStringWithRadixAndPadding(first1byte, 2, 8);

  return first8bit.charAt(0) === '0' && first8bit.charAt(1) === '0';
}

export function parseHeader(msg: Buffer): Header {
  // STUN Message Header is 20byte = 160bit
  const header = msg.slice(0, 20);

  const type = header.readUInt16BE(0);

  return { type };
}

export function parseAttributes(msg: Buffer): Attribute[] {
  // STUN Message Header is 20byte, rest is attributes
  const attrs = msg.slice(20, msg.length);

  const parsedAttrs: Map<number, Attribute> = new Map();
  let offset = 0;
  while (offset < attrs.length) {
    const type = attrs.readUInt16BE(offset);
    offset += 2; // 16bit = 2byte

    const length = attrs.readUInt16BE(offset);
    offset += 2; // 16bit = 2byte

    const value = attrs.slice(offset, offset + length);
    offset += length;

    // STUN Attribute must be in 32bit(= 4byte) boundary
    const paddingByte = calcPaddingByte(length, 4);
    offset += paddingByte;

    // skip duplicates
    if (parsedAttrs.has(type)) {
      continue;
    }
    parsedAttrs.set(type, { type, length, value });
  }

  return [...parsedAttrs.values()];
}
