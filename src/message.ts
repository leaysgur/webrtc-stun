import { calcPaddingByte, numberToStringWithRadixAndPadding } from './utils';
import { Header } from './header';
import { SoftwareAttribute } from './attribute/software';
import { XorMappedAddressAttribute } from './attribute/xor-mapped-address';
import { MappedAddressAttribute } from './attribute/mapped-address';
import { STUN_ATTRIBUTE_TYPE } from './attribute-type';

type Attributes =
  | SoftwareAttribute
  | XorMappedAddressAttribute
  | MappedAddressAttribute;

interface StunMessage {
  header: Header;
  body: Attributes[];
}

export function createStunMessage(msgInit: StunMessage): Buffer {
  const $body = Buffer.concat([...msgInit.body.map(i => i.toBuffer())]);
  const $header = msgInit.header.toBuffer($body.length);

  return Buffer.concat([$header, $body]);
}

export function parseStunMessage($buffer: Buffer): StunMessage {
  const $header = $buffer.slice(0, 20);
  const $body = $buffer.slice(20, $buffer.length);

  const header = Header.fromBuffer($header);
  const attrs = new Map<number, Attributes>();

  let offset = 0;
  while (offset < $body.length) {
    const type = $body.readUInt16BE(offset);
    offset += 2; // 16bit = 2byte

    const length = $body.readUInt16BE(offset);
    offset += 2; // 16bit = 2byte

    const $value = $body.slice(offset, offset + length);
    offset += $value.length;

    // STUN Attribute must be in 32bit(= 4byte) boundary
    const paddingByte = calcPaddingByte(length, 4);
    offset += paddingByte;

    // skip duplicates
    if (attrs.has(type)) {
      continue;
    }

    switch (type) {
      case STUN_ATTRIBUTE_TYPE.SOFTWARE:
        attrs.set(type, SoftwareAttribute.fromBuffer($value));
        break;
      case STUN_ATTRIBUTE_TYPE.MAPPED_ADDRESS:
        attrs.set(type, MappedAddressAttribute.fromBuffer($value));
        break;
      case STUN_ATTRIBUTE_TYPE.XOR_MAPPED_ADDRESS:
        attrs.set(type, XorMappedAddressAttribute.fromBuffer($value, header));
        break;
      default:
        console.log(
          `STUN attr type 0x${type.toString(16)} is not supported yet.`,
        );
    }
  }

  return { header, body: [...attrs.values()] };
}

export function isStunMessage(msg: Buffer): boolean {
  // 8bit is enough to know first and second bit
  const first1byte = msg.readUInt8(0);
  const first8bit = numberToStringWithRadixAndPadding(first1byte, 2, 8);

  return first8bit.charAt(0) === '0' && first8bit.charAt(1) === '0';
}
