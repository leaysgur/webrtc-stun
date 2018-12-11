import { createHeader } from './header';
import { createSoftware } from './attribute';
import { numberToStringWithRadixAndPadding } from './utils';

export function createBindingRequest(): Buffer {
  const body = Buffer.concat([
    // SHOULD
    createSoftware()
  ]);

  // body size is needed for message length
  const header = createHeader(body.length);

  return Buffer.concat([header, body]);
}

export function isStunMessage(msg: Buffer): boolean {
  const first1byte = msg.readUInt8(0);
  const first8bit = numberToStringWithRadixAndPadding(first1byte, 2, 8);
  return first8bit.charAt(0) === '0' && first8bit.charAt(1) === '0';
}
