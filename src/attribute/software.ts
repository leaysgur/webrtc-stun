import { STUN_ATTRIBUTE_TYPE } from '../constants';
import { writeAttrBuffer } from '../utils';

export interface SoftwarePayload {
  value: string;
}

export class SoftwareAttribute {
  static createBlank(): SoftwareAttribute {
    return new SoftwareAttribute('');
  }

  constructor(private value: string) {}

  get type(): number {
    return STUN_ATTRIBUTE_TYPE.SOFTWARE;
  }

  get payload(): SoftwarePayload {
    return { value: this.value };
  }

  toBuffer(): Buffer {
    const $value = Buffer.from(this.value);

    return writeAttrBuffer(STUN_ATTRIBUTE_TYPE.SOFTWARE, $value);
  }

  loadBuffer($attr: Buffer): boolean {
    this.value = $attr.toString();

    return true;
  }
}
