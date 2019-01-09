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
