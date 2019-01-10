import { STUN_ATTRIBUTE_TYPE } from '../constants';
import { writeAttrBuffer } from '../utils';

export interface MessageIntegrityPayload {
  value: Buffer;
}

export class MessageIntegrityAttribute {
  static createBlank(): MessageIntegrityAttribute {
    return new MessageIntegrityAttribute();
  }

  private value: Buffer;
  constructor() {
    // dummy, will be updated later
    this.value = Buffer.alloc(20);
  }

  get type(): number {
    return STUN_ATTRIBUTE_TYPE.MESSAGE_INTEGRITY;
  }

  get payload(): MessageIntegrityPayload {
    return {
      value: this.value,
    };
  }

  toBuffer(): Buffer {
    return writeAttrBuffer(STUN_ATTRIBUTE_TYPE.MESSAGE_INTEGRITY, this.value);
  }

  loadBuffer($attr: Buffer): boolean {
    $attr.copy(this.value);
    return true;
  }
}
