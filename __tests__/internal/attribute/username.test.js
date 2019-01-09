const { UsernameAttribute } = require('../../../lib/internal/attribute/username');

describe('static createBlank()', () => {
  test('create blank instance', () => {
    const blank = UsernameAttribute.createBlank();
    expect(blank).toBeInstanceOf(UsernameAttribute);
  });
});

describe('constructor()', () => {
  const attr = new UsernameAttribute('myname');

  test('has type', () => {
    expect(attr.type).toBe(0x0006);
  });

  test('has payload', () => {
    expect(attr.payload).toEqual({ value: 'myname' });
  });
});

describe('toBuffer()', () => {
  test('returns buffer', () => {
    const attr = new UsernameAttribute('test');

    const $buf = Buffer.from(
      '0006' + '0004' +
      '74657374'
    , 'hex');
    expect(attr.toBuffer().equals($buf)).toBeTruthy();
  });
});

describe('loadBuffer()', () => {
  test('loads from buffer', () => {
    const $buf = Buffer.from('74657374', 'hex');

    const blank = UsernameAttribute.createBlank();
    expect(blank.loadBuffer($buf)).toBeTruthy();
    expect(blank.payload).toEqual({ value: 'test' });
  });
});
