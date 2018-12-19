import { STUN_ATTRIBUTE_TYPE } from '../attribute-type';

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
  static fromBuffer(attr: Buffer): MappedAddressAttribute {
    const familyVal = attr.readUInt16BE(0);
    const family = {
      [`${0x01}`]: 4,
      [`${0x02}`]: 6,
    }[familyVal];

    const port = parsePort(attr);

    const address = {
      [`${0x01}`]: parseIpV4(attr),
      [`${0x02}`]: parseIpV6(attr),
    }[familyVal];

    return new MappedAddressAttribute(family, port, address);
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
    return Buffer.from([STUN_ATTRIBUTE_TYPE.MAPPED_ADDRESS]);
  }
}

function parsePort(attr: Buffer): number {
  const port = attr.slice(2, 4);
  return port.readUInt16BE(0);
}

function parseIpV4(attr: Buffer): string {
  const address = attr.slice(4, 8);
  return ipV4BufferToString(address);
}

function parseIpV6(attr: Buffer): string {
  const address = attr.slice(4, 20);
  return ipV6BufferToString(address);
}

// TODO: dupl
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
  return res.join(':')
    .replace(/(^|:)0(:0)*:0(:|$)/, '$1::$3')
    .replace(/:{3,4}/, '::');
}
