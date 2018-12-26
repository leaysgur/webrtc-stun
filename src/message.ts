import {
  calcPaddingByte,
  numberToStringWithRadixAndPadding,
} from './internal/utils';
import { Header } from './internal/header';
import { SoftwareAttribute } from './internal/attribute/software';
import { XorMappedAddressAttribute } from './internal/attribute/xor-mapped-address';
import { STUN_MESSAGE_TYPE, STUN_ATTRIBUTE_TYPE } from './internal/constants';

type Attribute = SoftwareAttribute | XorMappedAddressAttribute;

export class StunMessage {
  constructor(
    private header: Header = new Header(),
    private attributes: Map<number, Attribute> = new Map(),
  ) {}

  isBindingResponseSuccess(): boolean {
    return this.header.type === STUN_MESSAGE_TYPE.BINDING_RESPONSE_SUCCESS;
  }

  setBindingRequestType(): StunMessage {
    this.header.type = STUN_MESSAGE_TYPE.BINDING_REQUEST;

    return this;
  }

  setSoftwareAttribute(name: string): StunMessage {
    this.attributes.set(
      STUN_ATTRIBUTE_TYPE.SOFTWARE,
      new SoftwareAttribute(name),
    );

    return this;
  }

  getXorMappedAddressAttribute(): XorMappedAddressAttribute | null {
    const attr = this.attributes.get(STUN_ATTRIBUTE_TYPE.XOR_MAPPED_ADDRESS);

    return attr instanceof XorMappedAddressAttribute ? attr : null;
  }

  toBuffer(): Buffer {
    const $body = Buffer.concat(
      [...this.attributes.values()].map(i => i.toBuffer(this.header)),
    );
    const $header = this.header.toBuffer($body.length);

    return Buffer.concat([$header, $body]);
  }

  loadBuffer($buffer: Buffer): boolean {
    if (!this.isFirst2BitZero($buffer)) {
      return false;
    }

    const $header = $buffer.slice(0, 20);
    const $body = $buffer.slice(20, $buffer.length);

    // load header
    if (!this.header.loadBuffer($header)) {
      return false;
    }

    // load attributes
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
      if (this.attributes.has(type)) {
        continue;
      }

      const attr = this.getAttrByType(type);
      // skip not supported
      if (attr === null) {
        console.log(
          `STUN attr type 0x${type.toString(16)} is not supported yet.`,
        );
        continue;
      }

      // if attr has invalid value
      if (!attr.loadBuffer($value, this.header)) {
        return false;
      }

      this.attributes.set(type, attr);
    }

    return true;
  }

  private isFirst2BitZero($buffer: Buffer): boolean {
    // 8bit is enough to know first and second bit
    const first1byte = $buffer.readUInt8(0);
    const first8bit = numberToStringWithRadixAndPadding(first1byte, 2, 8);

    return first8bit.slice(0, 2) === '00';
  }

  private getAttrByType(type: number): Attribute | null {
    const Attr = {
      [`${STUN_ATTRIBUTE_TYPE.SOFTWARE}`]: SoftwareAttribute,
      [`${STUN_ATTRIBUTE_TYPE.XOR_MAPPED_ADDRESS}`]: XorMappedAddressAttribute,
    }[type];

    return Attr ? Attr.create() : null;
  }
}
