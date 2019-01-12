import { STUN_ATTRIBUTE_TYPE } from '../constants';
import { writeAttrBuffer } from '../utils';

export interface FingerprintPayload {
  value: Buffer;
}

export class FingerprintAttribute {
  static createBlank(): FingerprintAttribute {
    return new FingerprintAttribute();
  }

  private value: Buffer;
  constructor() {
    // dummy, will be updated later
    this.value = Buffer.alloc(4);
  }

  get type(): number {
    return STUN_ATTRIBUTE_TYPE.FINGERPRINT;
  }

  get payload(): FingerprintPayload {
    return {
      value: this.value,
    };
  }

  toBuffer(): Buffer {
    return writeAttrBuffer(STUN_ATTRIBUTE_TYPE.FINGERPRINT, this.value);
  }

  loadBuffer($attr: Buffer): boolean {
    $attr.copy(this.value);
    return true;
  }
}
