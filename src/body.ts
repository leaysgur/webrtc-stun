import { calcPaddingByte } from './utils';
import { Header } from './header';
import { SoftwareAttribute } from './attribute/software';
import { XorMappedAddressAttribute } from './attribute/xor-mapped-address';
import { MappedAddressAttribute } from './attribute/mapped-address';
import { STUN_ATTRIBUTE_TYPE } from './attribute-type';

type Attributes =
  | SoftwareAttribute
  | XorMappedAddressAttribute
  | MappedAddressAttribute;

export class Body {
  static fromBuffer($body: Buffer, header: Header): Body {
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

    return new Body([...attrs.values()]);
  }

  constructor(private attrs: Attributes[]) {}

  toBuffer(): Buffer {
    return Buffer.concat([...this.attrs.map(i => i.toBuffer())]);
  }
}
