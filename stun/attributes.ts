import { calcPaddingByte } from './utils';

export interface Attribute {
  type: number;
  length: number;
  value: Buffer;
}

function parse(attrs: Buffer): Attribute[] {
  const parsedAttrs: Map<number, Attribute> = new Map();

  let offset = 0;
  while (offset < attrs.length) {
    const type = attrs.readUInt16BE(offset);
    offset += 2; // 16bit = 2byte

    const length = attrs.readUInt16BE(offset);
    offset += 2; // 16bit = 2byte

    const value = attrs.slice(offset, offset + length);
    offset += length;
    // TODO: parseAttrValue by type

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

export default { parse }
