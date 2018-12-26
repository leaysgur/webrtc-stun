import { RemoteInfo } from 'dgram';
import {
  generateTransactionId,
  getFirst2Bit,
  calcPaddingByte,
} from './internal/utils';
import { Header } from './internal/header';
import { SoftwareAttribute } from './internal/attribute/software';
import { XorMappedAddressAttribute } from './internal/attribute/xor-mapped-address';
import { STUN_MESSAGE_TYPE, STUN_ATTRIBUTE_TYPE } from './internal/constants';

type Attribute = SoftwareAttribute | XorMappedAddressAttribute;

export class StunMessage {
  static createBlank(): StunMessage {
    return new StunMessage(new Header(-1, generateTransactionId()));
  }
  static createBindingRequest(): StunMessage {
    return new StunMessage(
      new Header(STUN_MESSAGE_TYPE.BINDING_REQUEST, generateTransactionId()),
    );
  }

  private header: Header;
  private attributes: Map<number, Attribute>;
  constructor(header: Header) {
    this.header = header;
    this.attributes = new Map();
  }

  createBindingResponse(isSuccess: boolean): StunMessage {
    const type = isSuccess
      ? STUN_MESSAGE_TYPE.BINDING_RESPONSE_SUCCESS
      : STUN_MESSAGE_TYPE.BINDING_RESPONSE_ERROR;
    const tid = this.header.transactionId;
    return new StunMessage(new Header(type, tid));
  }

  isBindingRequest(): boolean {
    return this.header.type === STUN_MESSAGE_TYPE.BINDING_REQUEST;
  }
  isBindingResponseSuccess(): boolean {
    return this.header.type === STUN_MESSAGE_TYPE.BINDING_RESPONSE_SUCCESS;
  }
  isBindingResponseError(): boolean {
    return this.header.type === STUN_MESSAGE_TYPE.BINDING_RESPONSE_ERROR;
  }

  setSoftwareAttribute(name: string): StunMessage {
    this.attributes.set(
      STUN_ATTRIBUTE_TYPE.SOFTWARE,
      new SoftwareAttribute(name),
    );

    return this;
  }

  setXorMappedAddressAttribute({
    family,
    port,
    address,
  }: RemoteInfo): StunMessage {
    this.attributes.set(
      STUN_ATTRIBUTE_TYPE.XOR_MAPPED_ADDRESS,
      new XorMappedAddressAttribute(family, port, address),
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
    if (getFirst2Bit($buffer) !== '00') {
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

  private getAttrByType(type: number): Attribute | null {
    const Attr = {
      [`${STUN_ATTRIBUTE_TYPE.SOFTWARE}`]: SoftwareAttribute,
      [`${STUN_ATTRIBUTE_TYPE.XOR_MAPPED_ADDRESS}`]: XorMappedAddressAttribute,
    }[type];

    return Attr ? Attr.createBlank() : null;
  }
}
