import { RemoteInfo } from 'dgram';
import {
  isStunMessage,
  generateTransactionId,
  generateHmacSha1Digest,
  calcPaddingByte,
} from './utils';
import { Header } from './header';
import {
  MappedAddressAttribute,
  MappedAddressPayload,
} from './attribute/mapped-address';
import { UsernameAttribute, UsernamePayload } from './attribute/username';
import {
  MessageIntegrityAttribute,
  MessageIntegrityPayload,
} from './attribute/message-integrity';
import {
  XorMappedAddressAttribute,
  XorMappedAddressPayload,
} from './attribute/xor-mapped-address';
import { SoftwareAttribute, SoftwarePayload } from './attribute/software';
import { STUN_MESSAGE_TYPE, STUN_ATTRIBUTE_TYPE } from './constants';

type Attribute =
  | MappedAddressAttribute
  | UsernameAttribute
  | MessageIntegrityAttribute
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
  private attributes: Attribute[];
  constructor(header: Header) {
    this.header = header;
    this.attributes = [];
  }

  createBindingResponse(isSuccess: boolean): StunMessage {
    const type = isSuccess
      ? STUN_MESSAGE_TYPE.BINDING_RESPONSE_SUCCESS
      : STUN_MESSAGE_TYPE.BINDING_RESPONSE_ERROR;
    // send back same id for transaction
    const tid = this.header.transactionId;
    return new StunMessage(new Header(type, tid));
  }

  isBindingRequest(): boolean {
    return this.header.type === STUN_MESSAGE_TYPE.BINDING_REQUEST;
  }
  isBindingResponseSuccess(): boolean {
    return this.header.type === STUN_MESSAGE_TYPE.BINDING_RESPONSE_SUCCESS;
  }

  setMappedAddressAttribute(rinfo: RemoteInfo): StunMessage {
    this.attributes.push(
      new MappedAddressAttribute(rinfo.family, rinfo.port, rinfo.address),
    );
    return this;
  }
  getMappedAddressAttribute(): MappedAddressPayload | null {
    return this.getPayloadByType<MappedAddressPayload>(
      STUN_ATTRIBUTE_TYPE.MAPPED_ADDRESS,
    );
  }

  setUsernameAttribute(name: string): StunMessage {
    this.attributes.push(new UsernameAttribute(name));
    return this;
  }
  getUsernameAttribute(): UsernamePayload | null {
    return this.getPayloadByType<UsernamePayload>(STUN_ATTRIBUTE_TYPE.USERNAME);
  }

  setMessageIntegrityAttribute(integrityKey: string): StunMessage {
    // first add with dummy to fix total length
    const attr = new MessageIntegrityAttribute();
    this.attributes.push(attr);

    // without MESSAGE-INTEGRITY(header: 4byte + value: 20byte(sha1))
    const $msg = this.toBuffer().slice(0, -24);
    const $digest = generateHmacSha1Digest(integrityKey, $msg);
    attr.loadBuffer($digest);

    return this;
  }
  getMessageIntegrityAttribute(): MessageIntegrityPayload | null {
    return this.getPayloadByType<MessageIntegrityPayload>(
      STUN_ATTRIBUTE_TYPE.MESSAGE_INTEGRITY,
    );
  }

  setXorMappedAddressAttribute(rinfo: RemoteInfo): StunMessage {
    this.attributes.push(
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
    this.attributes.push(new SoftwareAttribute(name));
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

  loadBuffer($buffer: Buffer, integrityKey?: string): boolean {
    if (!isStunMessage($buffer)) {
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

    const loadedAttrType: Set<number> = new Set();
    // load attributes
    let offset = 0;
    while (offset < $body.length) {
      const type = $body.readUInt16BE(offset);
      offset += 2; // 16bit = 2byte

      const length = $body.readUInt16BE(offset);
      offset += 2; // 16bit = 2byte

      // do not allow empty attr
      if (length === 0) {
        return false;
      }

      const $value = $body.slice(offset, offset + length);
      offset += $value.length;

      // STUN Attribute must be in 32bit(= 4byte) boundary
      const paddingByte = calcPaddingByte(length, 4);
      offset += paddingByte;

      // skip duplicates
      if (loadedAttrType.has(type)) {
        continue;
      }

      const attr = this.getBlankAttributeByType(type);
      // skip not supported
      if (attr === null) {
        console.log(`Attr type 0x${type.toString(16)} is not supported yet.`);
        continue;
      }

      // if attr has invalid value
      if (!attr.loadBuffer($value, this.header)) {
        return false;
      }

      this.attributes.push(attr);
      // mark as loaded
      loadedAttrType.add(type);
    }

    // check integrity if exists
    const messageIntegrity = this.getMessageIntegrityAttribute();
    if (messageIntegrity && integrityKey) {
      // without MESSAGE-INTEGRITY(header: 4byte + value: 20byte(sha1))
      const $msg = this.toBuffer().slice(0, -24);
      const $digest = generateHmacSha1Digest(integrityKey, $msg);
      if (!$digest.equals(messageIntegrity.value)) {
        return false;
      }
    }

    return true;
  }

  private getPayloadByType<T>(type: number): T | null {
    const attr = this.attributes.find(a => a.type === type);
    return attr !== undefined ? ((attr.payload as unknown) as T) : null;
  }

  private getBlankAttributeByType(type: number): Attribute | null {
    const Attr = {
      [`${STUN_ATTRIBUTE_TYPE.MAPPED_ADDRESS}`]: MappedAddressAttribute,
      [`${STUN_ATTRIBUTE_TYPE.USERNAME}`]: UsernameAttribute,
      [`${STUN_ATTRIBUTE_TYPE.MESSAGE_INTEGRITY}`]: MessageIntegrityAttribute,
      [`${STUN_ATTRIBUTE_TYPE.XOR_MAPPED_ADDRESS}`]: XorMappedAddressAttribute,
      [`${STUN_ATTRIBUTE_TYPE.SOFTWARE}`]: SoftwareAttribute,
    }[type];
    return Attr ? Attr.createBlank() : null;
  }
}
