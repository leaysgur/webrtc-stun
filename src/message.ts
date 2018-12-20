import { numberToStringWithRadixAndPadding } from './utils';
import { Header } from './header';
import { Body } from './body';

interface StunMessage {
  header: Header;
  body: Body;
}

export function createStunMessage(msgInit: StunMessage): Buffer {
  const body = msgInit.body.toBuffer();
  const header = msgInit.header.toBuffer(body.length);

  return Buffer.concat([header, body]);
}

export function parseStunMessage(buffer: Buffer): StunMessage {
  const $header = buffer.slice(0, 20);
  const $body = buffer.slice(20, buffer.length);

  const header = Header.fromBuffer($header);
  const body = Body.fromBuffer($body, header);

  return { header, body };
}

export function isStunMessage(msg: Buffer): boolean {
  // 8bit is enough to know first and second bit
  const first1byte = msg.readUInt8(0);
  const first8bit = numberToStringWithRadixAndPadding(first1byte, 2, 8);

  return first8bit.charAt(0) === '0' && first8bit.charAt(1) === '0';
}
