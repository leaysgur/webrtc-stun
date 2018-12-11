import { createHeader } from './header';
import { createSoftware } from './attribute';
import { numberToStringWithRadixAndPadding } from './utils';

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

interface Attribute {}
export function parseAttributes(msg: Buffer): Attribute[] {
  // STUN Message Header is 20byte = 160bit
  // const header = msg.slice(0, 20);
  const body = msg.slice(20, msg.length);
  console.log(`body: ${msg.length - 20}byte(${(msg.length - 20) * 8}bit)`);

  let offset = 0;
  while (offset < body.length) {
    const type = body.readUInt16BE(offset);
    offset += 2; // 16bit = 2byte

    const length = body.readUInt16BE(offset);
    offset += 2; // 16bit = 2byte

    const value = body.slice(offset, offset + length);
    offset += length;

    // STUN Attributes are in 32bit(4byte) boundary
    const missingBoundaryByte = length % 4;
    const paddingByte = missingBoundaryByte === 0 ? 0 : 4 - missingBoundaryByte;
    offset += paddingByte;

    console.log('------');
    console.log(`type: 0x${numberToStringWithRadixAndPadding(type, 16, 4)}`);
    console.log(`length: ${length}byte`);
    console.log(`value: ${value.toString('hex')}`);
    console.log('------');
  }

  return [];
}
