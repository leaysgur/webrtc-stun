import { STUN_ATTRIBUTE_TYPE } from '../constants';
import {
  bufferXor,
  writeAttrBuffer,
  ipV4BufferToString,
  ipV4StringToBuffer,
  ipV6BufferToString,
  ipV6StringToBuffer,
} from '../utils';
import { Header } from '../header';

/**
 * STUN XOR_MAPPED_ADDRESS Attribute
 *
 *  0                   1                   2                   3
 *  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |x x x x x x x x|    Family     |         X-Port                |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |                X-Address (Variable)                         ...
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *
 */
export class XorMappedAddressAttribute {
  static createBlank(): XorMappedAddressAttribute {
    return new XorMappedAddressAttribute('', -1, '');
  }

  constructor(
    private family: string,
    private port: number,
    private address: string,
  ) {}

  toBuffer(header: Header): Buffer {
    const $family = Buffer.alloc(2);
    $family.writeUInt16BE(this.family === 'IPv4' ? 0x01 : 0x02, 0);

    const $xport = this.encodePort(this.port, header);
    const $xaddress =
      this.family === 'IPv4'
        ? this.encodeIpV4(this.address, header)
        : this.encodeIpV6(this.address, header);

    const $value = Buffer.concat([$family, $xport, $xaddress]);

    return writeAttrBuffer(STUN_ATTRIBUTE_TYPE.XOR_MAPPED_ADDRESS, $value);
  }

  loadBuffer($attr: Buffer, header: Header): boolean {
    const family = $attr.readUInt16BE(0);
    this.family = family === 0x01 ? 'IPv4' : 'IPv6';

    this.port = this.decodePort($attr, header);
    this.address =
      family === 0x01
        ? this.decodeIpV4($attr, header)
        : this.decodeIpV6($attr, header);

    return true;
  }

  private decodePort($attr: Buffer, header: Header): number {
    const $xport = $attr.slice(2, 4);
    const $port = bufferXor($xport, header.magicCookieAsBuffer.slice(0, 2));
    return $port.readUInt16BE(0);
  }
  private encodePort(port: number, header: Header): Buffer {
    const $port = Buffer.alloc(2);
    $port.writeUInt16BE(port, 0);
    return bufferXor($port, header.magicCookieAsBuffer.slice(0, 2));
  }

  private decodeIpV4($attr: Buffer, header: Header): string {
    const $xaddress = $attr.slice(4, 8);
    const $ip = bufferXor($xaddress, header.magicCookieAsBuffer);
    return ipV4BufferToString($ip);
  }
  private encodeIpV4(ip: string, header: Header): Buffer {
    const $ip = ipV4StringToBuffer(ip);
    const $xaddress = bufferXor($ip, header.magicCookieAsBuffer);
    return $xaddress;
  }

  private decodeIpV6($attr: Buffer, header: Header): string {
    const $xaddress = $attr.slice(4, 20);

    const $ip = bufferXor(
      $xaddress,
      Buffer.concat([header.magicCookieAsBuffer, header.transactionIdAsBuffer]),
    );
    return ipV6BufferToString($ip);
  }
  private encodeIpV6(ip: string, header: Header): Buffer {
    const $ip = ipV6StringToBuffer(ip);
    const $xaddress = bufferXor(
      $ip,
      Buffer.concat([header.magicCookieAsBuffer, header.transactionIdAsBuffer]),
    );
    return $xaddress;
  }
}
