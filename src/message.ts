import { RemoteInfo } from 'dgram';
import {
  generateTransactionId,
  numberToBinaryStringArray,
  calcPaddingByte,
} from './internal/utils';
import { Header } from './internal/header';
import {
  UsernameAttribute,
  UsernamePayload,
} from './internal/attribute/username';
import {
  XorMappedAddressAttribute,
  XorMappedAddressPayload,
} from './internal/attribute/xor-mapped-address';
import {
  SoftwareAttribute,
  SoftwarePayload,
} from './internal/attribute/software';
import { STUN_MESSAGE_TYPE, STUN_ATTRIBUTE_TYPE } from './internal/constants';

type Attribute =
  | UsernameAttribute
  | XorMappedAddressAttribute
  | SoftwareAttribute;

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

  setUsernameAttribute(name: string): StunMessage {
    this.attributes.set(
      STUN_ATTRIBUTE_TYPE.USERNAME,
      new UsernameAttribute(name),
    );
    return this;
  }
  getUsernameAttribute(): UsernamePayload | null {
    return this.getPayloadByType<UsernamePayload>(STUN_ATTRIBUTE_TYPE.USERNAME);
  }

  setXorMappedAddressAttribute(rinfo: RemoteInfo): StunMessage {
    this.attributes.set(
      STUN_ATTRIBUTE_TYPE.XOR_MAPPED_ADDRESS,
      new XorMappedAddressAttribute(rinfo.family, rinfo.port, rinfo.address),
    );
    return this;
  }
  getXorMappedAddressAttribute(): XorMappedAddressPayload | null {
    return this.getPayloadByType<XorMappedAddressPayload>(
      STUN_ATTRIBUTE_TYPE.XOR_MAPPED_ADDRESS,
    );
  }

  setSoftwareAttribute(name: string): StunMessage {
    this.attributes.set(
      STUN_ATTRIBUTE_TYPE.SOFTWARE,
      new SoftwareAttribute(name),
    );
    return this;
  }
  getSoftwareAttribute(): SoftwarePayload | null {
    return this.getPayloadByType<SoftwarePayload>(STUN_ATTRIBUTE_TYPE.SOFTWARE);
  }

  toBuffer(): Buffer {
    const $body = Buffer.concat(
      [...this.attributes.values()].map(i => i.toBuffer(this.header)),
    );
    const $header = this.header.toBuffer($body.length);

    return Buffer.concat([$header, $body]);
  }

  loadBuffer($buffer: Buffer): boolean {
    // the first 2bit are 0 in first 1byte
    const first8bit = numberToBinaryStringArray($buffer[0], 8);
    if (!(first8bit[0] === '0' && first8bit[1] === '0')) {
      return false;
    }

    // STUN message header is 20byte
    const $header = $buffer.slice(0, 20);
    const $body = $buffer.slice(20, $buffer.length);

    // load header
    if (!this.header.loadBuffer($header)) {
      return false;
    }

    // message length + 20(header) = total length
    if (this.header.length + 20 !== $buffer.length) {
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

      const attr = this.getBlankAttributeByType(type);
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

  private getPayloadByType<T>(type: number): T | null {
    const attr = this.attributes.get(type);
    return attr !== undefined ? ((attr.payload as unknown) as T) : null;
  }

  private getBlankAttributeByType(type: number): Attribute | null {
    const Attr = {
      [`${STUN_ATTRIBUTE_TYPE.USERNAME}`]: UsernameAttribute,
      [`${STUN_ATTRIBUTE_TYPE.XOR_MAPPED_ADDRESS}`]: XorMappedAddressAttribute,
      [`${STUN_ATTRIBUTE_TYPE.SOFTWARE}`]: SoftwareAttribute,
    }[type];

    return Attr ? Attr.createBlank() : null;
  }
}
