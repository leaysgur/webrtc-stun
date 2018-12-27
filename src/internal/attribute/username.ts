import { STUN_ATTRIBUTE_TYPE } from '../constants';
import { writeAttrBuffer } from '../utils';
import { Header } from '../header';

export class UsernameAttribute {
  static createBlank(): UsernameAttribute {
    return new UsernameAttribute('');
  }

  constructor(private name: string) {}

  toBuffer(_header: Header): Buffer {
    const $value = Buffer.from(this.name);

    return writeAttrBuffer(STUN_ATTRIBUTE_TYPE.USERNAME, $value);
  }

  loadBuffer($attr: Buffer): boolean {
    this.name = $attr.toString();

    return true;
  }
}
