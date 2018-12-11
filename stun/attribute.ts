import { calcPaddingByte } from './utils';

/**
 * STUN Attribute
 *
 *  0                   1                   2                   3
 *  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |             Type             |            Length(byte)        |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |                        Value (variable)                    ....
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *
 * Value is N * 32 bit w/ padding bit (= 4N byte)
 */
export function createSoftware(softwareName: string): Buffer {
  // allocate dynamically for value
  const value = Buffer.from(softwareName);

  // 2byte(16bit) for type
  const type = Buffer.alloc(2);
  type.writeUInt16BE(0x8022, 0);

  // 2byte(16bit) for length
  const length = Buffer.alloc(2);
  length.writeUInt16BE(value.length, 0);

  // pad missing bytes
  const paddingByte = calcPaddingByte(value.length, 4);
  const padding = Buffer.alloc(paddingByte);

  return Buffer.concat([type, length, value, padding]);
}
