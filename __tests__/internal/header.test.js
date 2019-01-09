const { Header } = require('../../lib/internal/header');

describe('constructor()', () => {
  const type = 1;
  const tid = '999999999999999999999999';
  const header = new Header(type, tid);

  test('has passed type', () => {
    expect(header.type).toBe(type);
  });

  test('has 0 length', () => {
    expect(header.length).toBe(0);
  });

  test('has passed transactionId', () => {
    expect(header.transactionId).toBe(tid);
  });

  test('has valid magicCookie as Buffer', () => {
    const { magicCookieAsBuffer } = header;
    const $mcBuf = Buffer.from('2112a442', 'hex');
    expect(magicCookieAsBuffer.equals($mcBuf)).toBeTruthy();
    expect(magicCookieAsBuffer.length).toBe(4);
  });

  test('has valid transactionId as Buffer', () => {
    const { transactionIdAsBuffer } = header;
    const $tidBuf = Buffer.from(tid, 'hex');
    expect(transactionIdAsBuffer.equals($tidBuf)).toBeTruthy();
    expect(transactionIdAsBuffer.length).toBe(12);
  });
});

describe('toBuffer()', () => {
  test('returns 20byte buffer', () => {
    const header = new Header(11, 'dummy');
    expect(header.toBuffer().length).toBe(20);
  });
});

describe('loadBuffer()', () => {
  const header = new Header(0, '');

  test('returns true for valid buffer', () => {
    const $buf = Buffer.from(
      '0001' + '0000' +
      '2112a442' +
      '999999999999999999999999',
    'hex');
    expect(header.loadBuffer($buf)).toBeTruthy();
    expect(header.type).toBe(1);
  });

  test('returns false for invalid buffer(not supported type)', () => {
    const $buf = Buffer.from(
      '1234' + '0000' +
      '2112a442' +
      '999999999999999999999999',
    'hex');
    expect(header.loadBuffer($buf)).toBeFalsy();
  });

  test('returns false for invalid buffer(bad magicCookie)', () => {
    const $buf = Buffer.from(
      '0001' + '0000' +
      '88888888' +
      '999999999999999999999999',
    'hex');
    expect(header.loadBuffer($buf)).toBeFalsy();
  });
});
