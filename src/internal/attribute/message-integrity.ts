import { STUN_ATTRIBUTE_TYPE } from '../constants';
import { writeAttrBuffer } from '../utils';

export interface MessageIntegrityPayload {
  value: string;
}

export class MessageIntegrityAttribute {
  static createBlank(): MessageIntegrityAttribute {
    return new MessageIntegrityAttribute('');
  }

  constructor(private value: string) {}

  get type(): number {
    return STUN_ATTRIBUTE_TYPE.MESSAGE_INTEGRITY;
  }

  get payload(): MessageIntegrityPayload {
    return {
      value: this.value,
    };
  }

  toBuffer(): Buffer {
    const $value = Buffer.from(this.value);
    return writeAttrBuffer(STUN_ATTRIBUTE_TYPE.MESSAGE_INTEGRITY, $value);
  }

  loadBuffer($attr: Buffer): boolean {
    console.log($attr);
    return true;
  }
}
