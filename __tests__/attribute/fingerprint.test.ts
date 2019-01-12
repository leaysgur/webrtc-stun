import { FingerprintAttribute } from '../../src/attribute/fingerpinrt';

describe('static createBlank()', () => {
  test('create blank instance', () => {
    const blank = FingerprintAttribute.createBlank();
    expect(blank).toBeInstanceOf(FingerprintAttribute);
  });
});

describe('constructor()', () => {
  const attr = new FingerprintAttribute();

  test('has type', () => {
    expect(attr.type).toBe(0x8028);
  });

  test('has payload', () => {
    expect(attr.payload).toHaveProperty('value');
    expect(Buffer.isBuffer(attr.payload.value)).toBeTruthy();
  });
});

describe('toBuffer()', () => {
  test('returns buffer', () => {
    const attr = new FingerprintAttribute();

    const $buf = Buffer.from('8028' + '0004' + '000000000', 'hex');
    expect(attr.toBuffer().equals($buf)).toBeTruthy();
  });
});

describe('loadBuffer()', () => {
  test('loads from buffer', () => {
    const $buf = Buffer.from('11111111', 'hex');

    const blank = FingerprintAttribute.createBlank();
    expect(blank.loadBuffer($buf)).toBeTruthy();
    expect(blank.payload.value.equals($buf)).toBeTruthy();
  });

  test('does not update length', () => {
    const blank = FingerprintAttribute.createBlank();
    expect(blank.payload.value.length).toBe(4);

    const $buf1 = Buffer.from('11111111', 'hex');
    expect(blank.loadBuffer($buf1)).toBeTruthy();
    expect(blank.payload.value.length).toBe(4);

    const $buf2 = Buffer.from('222222222222222222222222222222222', 'hex');
    expect(blank.loadBuffer($buf2)).toBeTruthy();
    expect(blank.payload.value.length).toBe(4);

    const $buf3 = Buffer.from('', 'hex');
    expect(blank.loadBuffer($buf3)).toBeTruthy();
    expect(blank.payload.value.length).toBe(4);
  });
});
