import { STUN_ATTRIBUTE_TYPE } from '../constants';
import { writeAttrBuffer } from '../utils';
import { Header } from '../header';

export interface SoftwarePayload {
  name: string;
}

export class SoftwareAttribute {
  static createBlank(): SoftwareAttribute {
    return new SoftwareAttribute('');
  }

  constructor(private name: string) {}

  get payload(): SoftwarePayload {
    return { name: this.name };
  }

  toBuffer(_header: Header): Buffer {
    const $value = Buffer.from(this.name);

    return writeAttrBuffer(STUN_ATTRIBUTE_TYPE.SOFTWARE, $value);
  }

  loadBuffer($attr: Buffer): boolean {
    this.name = $attr.toString();

    return true;
  }
}
