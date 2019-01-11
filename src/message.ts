import { RemoteInfo } from 'dgram';
import {
  isStunMessage,
  generateFingerprint,
  generateIntegrity,
  generateIntegrityWithFingerprint,
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
  FingerprintAttribute,
  FingerprintPayload,
} from './attribute/fingerpinrt';
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
  | SoftwareAttribute
  | FingerprintAttribute;

interface ValidationTarget {
  transactionId?: string;
  integrityKey?: string;
  fingerprint?: boolean;
}

export class StunMessage {
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

  isBindingRequest(vt?: ValidationTarget): boolean {
    const isRequest = this.header.type === STUN_MESSAGE_TYPE.BINDING_REQUEST;
    let hasValidFingerprint = true;
    let hasValidIntegrity = true;

    if (vt && vt.fingerprint) {
      hasValidFingerprint = this.validateFingerprint();
    }
    if (vt && vt.integrityKey) {
      hasValidIntegrity = this.validateMessageIntegrity(vt.integrityKey);
    }

    return isRequest && hasValidFingerprint && hasValidIntegrity;
  }
  isBindingResponseSuccess(vt?: ValidationTarget): boolean {
    const isSuccessResp =
      this.header.type === STUN_MESSAGE_TYPE.BINDING_RESPONSE_SUCCESS;
    let hasValidTransactionId = true;
    let hasValidFingerprint = true;
    let hasValidIntegrity = true;

    if (vt && vt.transactionId) {
      hasValidTransactionId = this.header.transactionId === vt.transactionId;
    }
    if (vt && vt.fingerprint) {
      hasValidFingerprint = this.validateFingerprint();
    }
    if (vt && vt.integrityKey) {
      hasValidIntegrity = this.validateMessageIntegrity(vt.integrityKey);
    }

    return (
      isSuccessResp &&
      hasValidTransactionId &&
      hasValidFingerprint &&
      hasValidIntegrity
    );
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

    const $integrity = generateIntegrity(this.toBuffer(), integrityKey);
    attr.loadBuffer($integrity);

    return this;
  }
  getMessageIntegrityAttribute(): MessageIntegrityPayload | null {
    return this.getPayloadByType<MessageIntegrityPayload>(
      STUN_ATTRIBUTE_TYPE.MESSAGE_INTEGRITY,
    );
  }

  setFingerprintAttribute(): StunMessage {
    // first add with dummy to fix total length
    const attr = new FingerprintAttribute();
    this.attributes.push(attr);

    const $fp = generateFingerprint(this.toBuffer());
    attr.loadBuffer($fp);

    return this;
  }
  getFingerprintAttribute(): FingerprintPayload | null {
    return this.getPayloadByType<FingerprintPayload>(
      STUN_ATTRIBUTE_TYPE.FINGERPRINT,
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

  loadBuffer($buffer: Buffer): boolean {
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

    return true;
  }

  private validateMessageIntegrity(integrityKey: string): boolean {
    const messageIntegrityAttr = this.getMessageIntegrityAttribute();
    // check if integrity exists
    if (messageIntegrityAttr === null) {
      return true;
    }

    const fingerprintAttr = this.getFingerprintAttribute();
    // check if integrity w/o fingerprit
    if (fingerprintAttr === null) {
      const $digest = generateIntegrity(this.toBuffer(), integrityKey);
      return $digest.equals(messageIntegrityAttr.value);
    }

    // check if integrity w/ fingerprint
    return generateIntegrityWithFingerprint(
      this.toBuffer(),
      integrityKey,
    ).equals(messageIntegrityAttr.value);
  }

  private validateFingerprint(): boolean {
    const fingerprintAttr = this.getFingerprintAttribute();
    // check if fingerprint exists
    if (fingerprintAttr === null) {
      return true;
    }

    const $fp = generateFingerprint(this.toBuffer());
    return $fp.equals(fingerprintAttr.value);
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
      [`${STUN_ATTRIBUTE_TYPE.FINGERPRINT}`]: FingerprintAttribute,
    }[type];
    return Attr ? Attr.createBlank() : null;
  }
}
