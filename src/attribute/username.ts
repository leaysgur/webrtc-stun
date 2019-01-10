import { STUN_ATTRIBUTE_TYPE } from '../constants';
import { writeAttrBuffer } from '../utils';

export interface UsernamePayload {
  value: string;
}

export class UsernameAttribute {
  static createBlank(): UsernameAttribute {
    return new UsernameAttribute('');
  }

  constructor(private value: string) {}

  get type(): number {
    return STUN_ATTRIBUTE_TYPE.USERNAME;
  }

  get payload(): UsernamePayload {
    return { value: this.value };
  }

  toBuffer(): Buffer {
    const $value = Buffer.from(this.value);

    return writeAttrBuffer(STUN_ATTRIBUTE_TYPE.USERNAME, $value);
  }

  loadBuffer($attr: Buffer): boolean {
    this.value = $attr.toString();

    return true;
  }
}
