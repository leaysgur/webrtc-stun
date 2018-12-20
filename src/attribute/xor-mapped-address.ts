import { STUN_ATTRIBUTE_TYPE } from '../attribute-type';
import { bufferXor } from '../utils';
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

  constructor(
    private _family: number,
    private _port: number,
    private _address: string,
  ) {}

  get family(): number {
    return this._family;
  }

  get port(): number {
    return this._port;
  }

  get address(): string {
    return this._address;
  }

  toBuffer(): Buffer {
    // TODO: impl
    return Buffer.from([STUN_ATTRIBUTE_TYPE.XOR_MAPPED_ADDRESS]);
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
