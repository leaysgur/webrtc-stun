import { calcPaddingByte } from './utils';

interface Attribute {
  type: number;
  length: number;
  value: Buffer;
}
export type Attributes = Map<number, Attribute>;

function parse(attrs: Buffer): Attributes {
  const parsedAttrs: Attributes = new Map();

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

  return parsedAttrs;
}

export default { parse };
