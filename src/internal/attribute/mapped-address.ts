import { STUN_ATTRIBUTE_TYPE } from '../constants';
import {
  writeAttrBuffer,
  ipV4BufferToString,
  ipV4StringToBuffer,
  ipV6BufferToString,
  ipV6StringToBuffer,
} from '../utils';
import { Header } from '../header';

export interface MappedAddressPayload {
  family: string;
  port: number;
  address: string;
}

/**
 * STUN MAPPED_ADDRESS Attribute
 *
 *  0                   1                   2                   3
 *  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |x x x x x x x x|    Family     |           Port                |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |                  Address (Variable)                         ...
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *
 */
export class MappedAddressAttribute {
  static createBlank(): MappedAddressAttribute {
    return new MappedAddressAttribute('', -1, '');
  }

  constructor(
    private family: string,
    private port: number,
    private address: string,
  ) {}

  get type(): number {
    return STUN_ATTRIBUTE_TYPE.MAPPED_ADDRESS;
  }

  get payload(): MappedAddressPayload {
    return {
      family: this.family,
      port: this.port,
      address: this.address,
    };
  }

  toBuffer(_header: Header): Buffer {
    const $family = Buffer.alloc(2);
    $family.writeUInt16BE(this.family === 'IPv4' ? 0x01 : 0x02, 0);

    const $port = Buffer.alloc(2);
    $port.writeUInt16BE(this.port, 0);
    const $address =
      this.family === 'IPv4'
        ? ipV4StringToBuffer(this.address)
        : ipV6StringToBuffer(this.address);

    const $value = Buffer.concat([$family, $port, $address]);

    return writeAttrBuffer(STUN_ATTRIBUTE_TYPE.MAPPED_ADDRESS, $value);
  }

  loadBuffer($attr: Buffer, _header: Header): boolean {
    const family = $attr.readUInt16BE(0);
    this.family = family === 0x01 ? 'IPv4' : 'IPv6';

    this.port = $attr.readUInt16BE(2);

    const $address = family === 0x01 ? $attr.slice(4, 8) : $attr.slice(4, 20);
    this.address =
      family === 0x01
        ? ipV4BufferToString($address)
        : ipV6BufferToString($address);

    return true;
  }
}
