import { ATTRIBUTE_TYPE } from './constants';

/**
 * STUN Attribute
 *
 *  0                   1                   2                   3
 *  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |             Type             |            Length              |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |                        Value (variable)                    ....
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *
 */
export function createSoftware(): Buffer {
  // allocate dynamically for value
  const softwareName = 'webrtc-stack-study';
  const value = Buffer.from(softwareName);

  // 2byte(16bit) for type
  const type = Buffer.alloc(2);
  type.writeUInt16BE(ATTRIBUTE_TYPE.SOFTWARE, 0);

  // 2byte(16bit) for length
  const length = Buffer.alloc(2);
  length.writeUInt16BE(value.length, 0);

  return Buffer.concat([type, length, value]);
}
