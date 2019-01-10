import { SoftwareAttribute } from '../../../src/internal/attribute/software';

describe('static createBlank()', () => {
  test('create blank instance', () => {
    const blank = SoftwareAttribute.createBlank();
    expect(blank).toBeInstanceOf(SoftwareAttribute);
  });
});

describe('constructor()', () => {
  const attr = new SoftwareAttribute('hello');

  test('has type', () => {
    expect(attr.type).toBe(0x8022);
  });

  test('has payload', () => {
    expect(attr.payload).toEqual({ value: 'hello' });
  });
});

describe('toBuffer()', () => {
  test('returns buffer', () => {
    const attr = new SoftwareAttribute('test');

    const $buf = Buffer.from('8022' + '0004' + '74657374', 'hex');
    expect(attr.toBuffer().equals($buf)).toBeTruthy();
  });
});

describe('loadBuffer()', () => {
  test('loads from buffer', () => {
    const $buf = Buffer.from('74657374', 'hex');

    const blank = SoftwareAttribute.createBlank();
    expect(blank.loadBuffer($buf)).toBeTruthy();
    expect(blank.payload).toEqual({ value: 'test' });
  });
});
