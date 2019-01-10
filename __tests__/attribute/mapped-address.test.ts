import { MappedAddressAttribute } from '../../src/attribute/mapped-address';

describe('static createBlank()', () => {
  test('create blank instance', () => {
    const blank = MappedAddressAttribute.createBlank();
    expect(blank).toBeInstanceOf(MappedAddressAttribute);
  });
});

describe('constructor()', () => {
  const rinfo = {
    family: 'IPv4',
    port: 12345,
    address: '0.0.0.0',
  };
  const attr = new MappedAddressAttribute(
    rinfo.family,
    rinfo.port,
    rinfo.address,
  );

  test('has type', () => {
    expect(attr.type).toBe(0x0001);
  });

  test('has payload', () => {
    expect(attr.payload).toEqual(rinfo);
  });
});

describe('toBuffer()', () => {
  test('returns buffer from IPv4', () => {
    const rinfo = {
      family: 'IPv4',
      port: 12345,
      address: '192.168.0.4',
    };
    const attr = new MappedAddressAttribute(
      rinfo.family,
      rinfo.port,
      rinfo.address,
    );

    const $buf = Buffer.from(
      '0001' + '0008' + '0001' + '3039' + 'c0a80004',
      'hex',
    );
    expect(attr.toBuffer().equals($buf)).toBeTruthy();
  });
});

describe('loadBuffer()', () => {
  test('loads from IPv4 buffer', () => {
    const rinfo = {
      family: 'IPv4',
      port: 12345,
      address: '192.168.0.4',
    };
    const $buf = Buffer.from('0001' + '3039' + 'c0a80004', 'hex');

    const blank = MappedAddressAttribute.createBlank();
    expect(blank.loadBuffer($buf)).toBeTruthy();
    expect(blank.payload).toEqual(rinfo);
  });
});
