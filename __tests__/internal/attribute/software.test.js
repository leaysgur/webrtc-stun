const { SoftwareAttribute } = require('../../../lib/internal/attribute/software');

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
