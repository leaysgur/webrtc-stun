import { STUN_ATTRIBUTE_TYPE } from '../attribute-type';
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
  static fromBuffer(attr: Buffer, header: Header): XorMappedAddressAttribute {
    const familyVal = attr.readUInt16BE(0);
    const family = {
      [`${0x01}`]: 4,
      [`${0x02}`]: 6,
    }[familyVal];

    const port = parsePort(attr, header);

    const address = {
      [`${0x01}`]: parseIpV4(attr, header),
      [`${0x02}`]: parseIpV6(attr, header),
    }[familyVal];

    return new XorMappedAddressAttribute(family, port, address);
  }

  public type: number;
  public payload: {
    family: number;
    port: number;
    address: string;
  };

  constructor(family: number, port: number, address: string) {
    this.type = STUN_ATTRIBUTE_TYPE.XOR_MAPPED_ADDRESS;
    this.payload = {
      family,
      port,
      address,
    };
  }

  // TODO: check IPv4 or IPv6
  toBuffer(header: Header): Buffer {
    const family = Buffer.alloc(2);
    family.writeUInt16BE(this.payload.family === 4 ? 0x01 : 0x02, 0);

    const port = Buffer.alloc(2);
    port.writeUInt16BE(this.payload.port, 0);
    const xport = bufferXor(port, header.getMagicCookieAsBuffer());

    const address = Buffer.from(this.payload.address.split('.'));
    const xaddress = bufferXor(address, header.getMagicCookieAsBuffer());

    const value = Buffer.concat([family, xport, xaddress]);
    const paddingByte = calcPaddingByte(value.length, 4);
    const padding = Buffer.alloc(paddingByte);

    return Buffer.concat([value, padding]);
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
