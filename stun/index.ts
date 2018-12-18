import { numberToStringWithRadixAndPadding } from './utils';

export function isStunMessage(msg: Buffer): boolean {
  // 8bit is enough to know first and second bit
  const first1byte = msg.readUInt8(0);
  const first8bit = numberToStringWithRadixAndPadding(first1byte, 2, 8);

  return first8bit.charAt(0) === '0' && first8bit.charAt(1) === '0';
}

export * from './message';
export * from './header';
export * from './attribute/software';
export * from './message-type';
