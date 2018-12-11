import header, { Header } from './internal/header';
import attributes, { Attributes } from './internal/attributes';
import { numberToStringWithRadixAndPadding } from './internal/utils';

interface Message {
  header: Header;
  attrs: Attributes;
}

export function isStunMessage(msg: Buffer): boolean {
  // 8bit is enough to know first 0, 1bit
  const first1byte = msg.readUInt8(0);
  const first8bit = numberToStringWithRadixAndPadding(first1byte, 2, 8);

  return first8bit.charAt(0) === '0' && first8bit.charAt(1) === '0';
}

export function parseMessage(msg: Buffer): Message {
  // STUN Message Header is 20byte = 160bit
  // so, rest of part is Attributes
  return {
    header: header.parse(msg.slice(0, 20)),
    attrs: attributes.parse(msg.slice(20, msg.length)),
  };
}
