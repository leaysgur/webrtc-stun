// import { Header } from './header';
// import attributes, { Attributes } from './internal/attributes';
import { numberToStringWithRadixAndPadding } from './utils';

// interface Message {
//   header: Header;
//   attrs: Attributes;
// }

// export * from './reader';
export function isStunMessage(msg: Buffer): boolean {
  // 8bit is enough to know first and second bit
  const first1byte = msg.readUInt8(0);
  const first8bit = numberToStringWithRadixAndPadding(first1byte, 2, 8);

  return first8bit.charAt(0) === '0' && first8bit.charAt(1) === '0';
}

// export function parseStunMessage(msg: Buffer): Message {
//   // STUN Message Header is 20byte
//   // so, rest of part is Attributes
//   return {
//     header: header.parse(msg.slice(0, 20)),
//     attrs: attributes.parse(msg.slice(20, msg.length)),
//   };
// }

export * from './message';
export * from './header';
export * from './attribute/software';
export * from './message-type';
// export * from './attribute-type';
