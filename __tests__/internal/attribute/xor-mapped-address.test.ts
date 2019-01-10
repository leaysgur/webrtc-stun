import { XorMappedAddressAttribute } from '../../../lib/internal/attribute/xor-mapped-address';
import { Header } from '../../../lib/internal/header';

describe('static createBlank()', () => {
  test('create blank instance', () => {
    const blank = XorMappedAddressAttribute.createBlank();
    expect(blank).toBeInstanceOf(XorMappedAddressAttribute);
  });
});

describe('constructor()', () => {
  const rinfo = {
    family: 'IPv4',
    port: 12345,
    address: '0.0.0.0',
  };
  const attr = new XorMappedAddressAttribute(
    rinfo.family,
    rinfo.port,
    rinfo.address,
  );

  test('has type', () => {
    expect(attr.type).toBe(0x0020);
  });

  test('has payload', () => {
    expect(attr.payload).toEqual(rinfo);
  });
});

describe('toBuffer()', () => {
  const header = new Header(1, '999999999999999999999999');

  test('returns buffer from IPv4', () => {
    const rinfo = {
      family: 'IPv4',
      port: 12345,
      address: '192.168.0.4',
    };
    const attr = new XorMappedAddressAttribute(
      rinfo.family,
      rinfo.port,
      rinfo.address,
    );

    const $buf = Buffer.from(
      '0020' + '0008' + '0001' + '112b' + 'e1baa446',
      'hex',
    );
    expect(attr.toBuffer(header).equals($buf)).toBeTruthy();
  });
});

describe('loadBuffer()', () => {
  const header = new Header(1, '999999999999999999999999');

  test('loads from IPv4 buffer', () => {
    const rinfo = {
      family: 'IPv4',
      port: 12345,
      address: '192.168.0.4',
    };
    const $buf = Buffer.from('0001' + '112b' + 'e1baa446', 'hex');

    const blank = XorMappedAddressAttribute.createBlank();
    expect(blank.loadBuffer($buf, header)).toBeTruthy();
    expect(blank.payload).toEqual(rinfo);
  });
});
