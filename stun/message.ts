import { calcPaddingByte } from './utils';
import { Header } from './header';
import { SoftwareAttribute } from './attribute/software';
import { XorMappedAddressAttribute } from './attribute/xor-mapped-address';
import { STUN_ATTRIBUTE_TYPE } from './attribute-type';

type Attributes = SoftwareAttribute | XorMappedAddressAttribute;

export class StunMessage {
  static fromBuffer(buffer: Buffer): StunMessage {
    const head = buffer.slice(0, 20);
    const body = buffer.slice(20, buffer.length);

    const header = Header.fromBuffer(head);
    const attrs = [];

    let offset = 0;
    while (offset < body.length) {
      const type = body.readUInt16BE(offset);
      offset += 2; // 16bit = 2byte

      const length = body.readUInt16BE(offset);
      offset += 2; // 16bit = 2byte

      const value = body.slice(offset, offset + length);
      offset += value.length;

      // STUN Attribute must be in 32bit(= 4byte) boundary
      const paddingByte = calcPaddingByte(length, 4);
      offset += paddingByte;

      // TODO: skip duplicates

      switch (type) {
        case STUN_ATTRIBUTE_TYPE.SOFTWARE:
          attrs.push(SoftwareAttribute.fromBuffer(value));
          break;
        case STUN_ATTRIBUTE_TYPE.XOR_MAPPED_ADDRESS:
          attrs.push(XorMappedAddressAttribute.fromBuffer(value, header));
          break;
      }
    }

    return new StunMessage(header, attrs);
  }

  constructor(private header: Header, private body: Attributes[]) {}

  toBuffer(): Buffer {
    const attrs = this.body.map(i => i.toBuffer());
    const body = Buffer.concat([...attrs]);
    this.header.setLength(body.length);

    return Buffer.concat([this.header.toBuffer(), body]);
  }
}
