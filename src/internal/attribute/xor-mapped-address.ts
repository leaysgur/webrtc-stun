import { STUN_ATTRIBUTE_TYPE } from '../constants';
import { bufferXor, calcPaddingByte } from '../utils';
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
    return new XorMappedAddressAttribute('', 0, '');
  }

  constructor(
    private family: string,
    private port: number,
    private address: string,
  ) {}

  // TODO: check IPv4 or IPv6
  toBuffer(header: Header): Buffer {
    const family = Buffer.alloc(2);
    family.writeUInt16BE(this.family === 'IPv4' ? 0x01 : 0x02, 0);

    const port = Buffer.alloc(2);
    port.writeUInt16BE(this.port, 0);
    const xport = bufferXor(port, header.getMagicCookieAsBuffer());

    const address = Buffer.from(this.address.split('.'));
    const xaddress = bufferXor(address, header.getMagicCookieAsBuffer());

    const value = Buffer.concat([family, xport, xaddress]);
    const paddingByte = calcPaddingByte(value.length, 4);
    const padding = Buffer.alloc(paddingByte);

    // 2byte(16bit) for type
    const type = Buffer.alloc(2);
    type.writeUInt16BE(STUN_ATTRIBUTE_TYPE.XOR_MAPPED_ADDRESS, 0);

    // 2byte(16bit) for length
    const length = Buffer.alloc(2);
    length.writeUInt16BE(value.length, 0);

    return Buffer.concat([type, length, value, padding]);
  }

  loadBuffer(attr: Buffer, header: Header): boolean {
    const familyVal = attr.readUInt16BE(0);
    this.family = {
      [`${0x01}`]: 'IPv4',
      [`${0x02}`]: 'IPv6',
    }[familyVal];

    this.port = parsePort(attr, header);

    this.address = {
      [`${0x01}`]: parseIpV4(attr, header),
      [`${0x02}`]: parseIpV6(attr, header),
    }[familyVal];

    return true;
  }
}

function parsePort(attr: Buffer, header: Header): number {
  const xport = attr.slice(2, 4);

  const xored = bufferXor(xport, header.getMagicCookieAsBuffer());
  return xored.readUInt16BE(0);
}

function parseIpV4(attr: Buffer, header: Header): string {
  const xaddress = attr.slice(4, 8);

  const xored = bufferXor(xaddress, header.getMagicCookieAsBuffer());
  return ipV4BufferToString(xored);
}

function parseIpV6(attr: Buffer, header: Header): string {
  const xaddress = attr.slice(4, 20);

  const xored = bufferXor(
    xaddress,
    Buffer.concat([
      header.getMagicCookieAsBuffer(),
      header.getTransactionIdAsBuffer(),
    ]),
  );
  return ipV6BufferToString(xored);
}

function ipV4BufferToString(buf: Buffer): string {
  const res = [];
  for (const digit of buf) {
    res.push(digit);
  }
  return res.join('.');
}

function ipV6BufferToString(buf: Buffer): string {
  const res = [];
  for (let i = 0; i < buf.length; i += 2) {
    res.push(buf.readUInt16BE(i).toString(16));
  }
  return res
    .join(':')
    .replace(/(^|:)0(:0)*:0(:|$)/, '$1::$3')
    .replace(/:{3,4}/, '::');
}
